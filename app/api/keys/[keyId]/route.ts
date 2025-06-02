import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@/app/generated/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// Get API key details
export async function GET(
  req: Request,
  { params }: { params: { keyId: string } }
) {
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

    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: params.keyId,
        userId: user.id
      },
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

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error("Error getting API key:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Update API key
export async function PATCH(
  req: Request,
  { params }: { params: { keyId: string } }
) {
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

    const { name, enabled, rateLimitEnabled, rateLimitMax } = await req.json();

    const apiKey = await prisma.apiKey.update({
      where: {
        id: params.keyId,
        userId: user.id
      },
      data: {
        name,
        enabled,
        rateLimitEnabled,
        rateLimitMax
      },
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

    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error("Error updating API key:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Delete API key
export async function DELETE(
  req: Request,
  { params }: { params: { keyId: string } }
) {
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

    await prisma.apiKey.delete({
      where: {
        id: params.keyId,
        userId: user.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 