import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "../../generated/prisma";
import { authOptions } from "../auth/auth.config";
import crypto from "crypto";

const prisma = new PrismaClient();

// Helper to generate API key
function generateApiKey(): string {
  return `lume_${crypto.randomBytes(32).toString('hex')}`;
}

// Helper to validate bank settings
function validateBankSettings(settings: any): boolean {
  return settings && settings.bankAccount && settings.bankName === 'CBE';
}

// Create API key
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name } = await req.json();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        settings: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has configured bank settings
    if (!validateBankSettings(user.settings)) {
      return NextResponse.json(
        { 
          error: "Bank account details not configured",
          message: "Please configure your bank account details in settings before creating an API key"
        },
        { status: 400 }
      );
    }

    // Check if user already has an API key
    const existingKey = await prisma.apiKey.findFirst({
      where: { userId: user.id }
    });

    if (existingKey) {
      return NextResponse.json(
        { 
          error: "API key already exists",
          message: "You already have an API key. You can manage it in the API Key section."
        },
        { status: 400 }
      );
    }

    const apiKey = await prisma.apiKey.create({
      data: {
        name: name || "Default Key",
        key: generateApiKey(),
        userId: user.id,
        remainingCredits: 100,
        rateLimitEnabled: true,
        rateLimitTimeWindow: 1000 * 60 * 60 * 24, // 1 day
        rateLimitMax: 1000, // 1000 requests per day
      }
    });

    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// List API keys
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        apiKeys: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            key: true,
            remainingCredits: true,
            enabled: true,
            rateLimitEnabled: true,
            rateLimitMax: true,
            lastUsedAt: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ apiKeys: user.apiKeys });
  } catch (error) {
    console.error("Error listing API keys:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 