import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "../../../generated/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// Create a payment intent
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { amount, customerEmail, metadata } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    const intent = await prisma.intent.create({
      data: {
        userId: session.user.id,
        amount,
        customerEmail,
        metadata,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes expiry
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

// List intents for the authenticated user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const intents = await prisma.intent.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        payment: true
      }
    });

    return NextResponse.json({ intents });
  } catch (error) {
    console.error("Error listing intents:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 