import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../../../generated/prisma";

const prisma = new PrismaClient();

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

    // Get the intent
    const intent = await prisma.intent.findUnique({
      where: { id: params.intentId },
      include: {
        payment: true
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

    // Check if transaction ID is already used
    const existingPayment = await prisma.payment.findUnique({
      where: { transactionId }
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: "Transaction ID already used" },
        { status: 400 }
      );
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        intentId: intent.id,
        transactionId,
        amount: intent.amount,
        status: 'pending',
        metadata: intent.metadata
      }
    });

    // Update intent status
    const updatedIntent = await prisma.intent.update({
      where: { id: intent.id },
      data: { status: 'processing' },
      include: {
        payment: true
      }
    });

    return NextResponse.json({ intent: updatedIntent });
  } catch (error) {
    console.error("Error submitting payment:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 