import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@/app/generated/prisma"; 
import { authOptions } from "@/app/api/auth/auth.config";

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

    const { name } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Update user name
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { name: name.trim() }
    });

    // Remove sensitive data from response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: "Name updated successfully",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Error updating name:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 