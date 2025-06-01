import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import axios from "axios";

const prisma = new PrismaClient();
const VERIFICATION_SERVICE_URL = process.env.VERIFICATION_SERVICE_URL || 'http://localhost:8000';

// Helper to check if user has valid bank details
const validateMerchantBankDetails = (settings: any) => {
  if (!settings || !settings.bankAccount || !settings.bankName) {
    throw new Error('Merchant bank details not configured');
  }
  // For now we only support CBE
  if (settings.bankName !== 'CBE') {
    throw new Error('Only CBE bank is supported at the moment');
  }
};

// Get intent details (public route for customers)
export async function GET(
  req: Request,
  { params }: { params: { intentId: string } }
) {
  try {
    const intent = await prisma.intent.findUnique({
      where: { id: params.intentId },
      select: {
        id: true,
        amount: true,
        status: true,
        customerEmail: true,
        createdAt: true,
        expiresAt: true
      }
    });

    if (!intent) {
      return NextResponse.json(
        { error: "Intent not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ intent });
  } catch (error) {
    console.error("Error fetching intent:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Submit payment for an intent
export async function POST(
  req: Request,
  { params }: { params: { intentId: string } }
) {
  try {
    // Get user ID from middleware
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
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
      return NextResponse.json(
        { error: "This transaction ID has already been used for another payment" },
        { status: 400 }
      );
    }

    // Get intent with merchant details
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

    if (intent.status !== "pending") {
      return NextResponse.json(
        { error: "Intent is no longer pending" },
        { status: 400 }
      );
    }

    // Validate merchant bank details
    try {
      validateMerchantBankDetails(intent.user.settings);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Call verification service
    const verificationResponse = await axios.post(
      `${VERIFICATION_SERVICE_URL}/verify`,
      {
        transaction_id: transactionId,
        expected_receiver_name: intent.user.name,
        expected_receiver_account: intent.user.settings.bankAccount,
        expected_amount: intent.amount,
        intent_created_at: intent.createdAt.toISOString()
      },
      { timeout: 60000 }
    );

    const verificationResult = verificationResponse.data;

    if (!verificationResult.success) {
      return NextResponse.json(
        {
          error: "Payment verification failed",
          message: verificationResult.message
        },
        { status: 400 }
      );
    }

    // Create payment record
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
    await prisma.intent.update({
      where: { id: intent.id },
      data: { status: "completed" }
    });

    // TODO: Implement webhook service
    // For now, we'll just log it
    console.log('Payment completed:', {
      intentId: intent.id,
      paymentId: payment.id,
      amount: payment.amount
    });

    return NextResponse.json({
      success: true,
      payment,
      verificationDetails: verificationResult.details
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 