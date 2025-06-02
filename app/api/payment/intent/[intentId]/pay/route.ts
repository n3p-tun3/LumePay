import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import axios from 'axios';

const prisma = new PrismaClient();
const VERIFICATION_SERVICE_URL = process.env.VERIFICATION_SERVICE_URL || 'http://localhost:8000';

interface BankSettings {
  bankAccount: string;
  bankName: string;
}

// Type guard to check if an object is BankSettings
function isBankSettings(obj: unknown): obj is BankSettings {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'bankAccount' in obj &&
    'bankName' in obj &&
    typeof (obj as BankSettings).bankAccount === 'string' &&
    typeof (obj as BankSettings).bankName === 'string'
  );
}

// Helper to check if user has valid bank details
const validateMerchantBankDetails = (settings: unknown) => {
  if (!isBankSettings(settings)) {
    throw new Error('Merchant bank details not configured');
  }
  // For now we only support CBE
  if (settings.bankName !== 'CBE') {
    throw new Error('Only CBE bank is supported at the moment');
  }
  return settings;
};

// Submit payment for an intent
export async function POST(
  req: Request,
  { params }: { params: { intentId: string } }
) {
  try {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 401 }
      );
    }

    // Find and validate API key
    const key = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true }
    });

    if (!key) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    if (!key.enabled) {
      return NextResponse.json(
        { error: "API key is disabled" },
        { status: 401 }
      );
    }

    const { transactionId } = await req.json();

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // Check if transaction ID has been used before
    const existingPayment = await prisma.payment.findFirst({
      where: {
        transactionId,
        status: "completed"
      }
    });

    if (existingPayment) {
      return NextResponse.json({ 
        error: "This transaction ID has already been used for another payment" 
      }, { status: 400 });
    }

    // Get the intent with merchant details
    const intent = await prisma.intent.findUnique({
      where: { id: params.intentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            settings: true
          }
        }
      }
    });

    if (!intent) {
      return NextResponse.json(
        { error: "Intent not found" },
        { status: 404 }
      );
    }

    if (intent.userId !== key.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (intent.status !== 'pending') {
      return NextResponse.json(
        { error: "Intent is not in pending state" },
        { status: 400 }
      );
    }

    if (intent.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Intent has expired" },
        { status: 400 }
      );
    }

    // Validate merchant bank details and get validated settings
    let bankSettings: BankSettings;
    try {
      bankSettings = validateMerchantBankDetails(intent.user.settings);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Call verification service
    const verificationResponse = await axios.post(`${VERIFICATION_SERVICE_URL}/verify`, {
      transaction_id: transactionId,
      expected_receiver_name: intent.user.name,
      expected_receiver_account: bankSettings.bankAccount,
      expected_amount: intent.amount,
      intent_created_at: intent.createdAt.toISOString()
    }, { timeout: 60000 });

    console.log("bankSettings", bankSettings);

    const verificationResult = verificationResponse.data;

    if (!verificationResult.success) {
      return NextResponse.json({
        error: "Payment verification failed",
        message: verificationResult.message
      }, { status: 400 });
    }

    // Check if we have enough credits before proceeding
    if (key.remainingCredits <= 0) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    // Create payment record with verification data
    const payment = await prisma.payment.create({
      data: {
        userId: intent.userId,
        intentId: intent.id,
        amount: parseFloat(verificationResult.details.amount),
        transactionId,
        status: "completed",
        verificationData: {
          payer: verificationResult.details.payer,
          amount: verificationResult.details.amount,
          date: verificationResult.details.date,
          receiver: verificationResult.details.receiver
        }
      }
    });

    // Update intent status
    const updatedIntent = await prisma.intent.update({
      where: { id: intent.id },
      data: { status: 'completed' },
      include: {
        payment: true
      }
    });

    // Deduct credit only after successful payment
    await prisma.apiKey.update({
      where: { id: key.id },
      data: {
        remainingCredits: key.remainingCredits - 1,
        lastUsedAt: new Date()
      }
    });

    // TODO: Trigger webhook asynchronously
    // webhookService.sendWebhook(intent.userId, payment).catch(error => {
    //   console.error('Webhook delivery error:', error);
    // });

    return NextResponse.json({ 
      success: true,
      intent: updatedIntent,
      payment,
      verificationDetails: verificationResult.details
    });
  } catch (error: any) {
    console.error("Error submitting payment:", error);
    if (error.response?.data) {
      return NextResponse.json(
        { error: error.response.data.message || "Payment verification failed" },
        { status: error.response.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 