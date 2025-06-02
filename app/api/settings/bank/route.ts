import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@/app/generated/prisma"; 
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { bankAccount, bankName } = await req.json();

    // Validate input
    if (!bankAccount || !bankName) {
      return NextResponse.json(
        { error: "Bank account and bank name are required" },
        { status: 400 }
      );
    }

    // Validate bank account number format (13 digits for CBE)
    if (!/^\d{13}$/.test(bankAccount)) {
      return NextResponse.json(
        { error: "Invalid bank account number format" },
        { status: 400 }
      );
    }

    // Validate bank name (only CBE supported for now)
    if (bankName !== 'CBE') {
      return NextResponse.json(
        { error: "Only CBE bank is supported at the moment" },
        { status: 400 }
      );
    }

    // Update user settings
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        settings: {
          bankAccount,
          bankName
        }
      }
    });

    // Remove sensitive data from response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: "Bank settings updated successfully",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Error updating bank settings:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 