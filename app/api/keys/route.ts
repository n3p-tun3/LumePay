import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "../../generated/prisma";
import { authOptions } from "../auth/[...nextauth]/route";
import crypto from "crypto";

const prisma = new PrismaClient();

// Helper to generate API key
function generateApiKey(): string {
  return `lume_${crypto.randomBytes(32).toString('hex')}`;
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
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
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
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        remainingCredits: true,
        enabled: true,
        rateLimitEnabled: true,
        rateLimitMax: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ apiKeys });
  } catch (error) {
    console.error("Error listing API keys:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 