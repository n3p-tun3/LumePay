import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

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

// Create a payment intent
export async function POST(req: Request) {
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

    if (key.remainingCredits <= 0) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    const { amount, customerEmail, metadata } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    // Validate merchant bank details
    try {
      validateMerchantBankDetails(key.user.settings);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    const intent = await prisma.intent.create({
      data: {
        userId: key.userId,
        amount,
        customerEmail,
        metadata,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes expiry
      }
    });

    // Update last used timestamp without deducting credits
    await prisma.apiKey.update({
      where: { id: key.id },
      data: {
        lastUsedAt: new Date()
      }
    });

    return NextResponse.json({ intent });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 