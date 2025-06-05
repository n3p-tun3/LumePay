import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { message: 'Token is required' },
        { status: 400 }
      );
    }

    // Find the token and check if it's valid
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (resetToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: { token },
      });

      return NextResponse.json(
        { message: 'Token has expired' },
        { status: 400 }
      );
    }

    // Token is valid
    return NextResponse.json({ 
      message: 'Token is valid',
      email: resetToken.user.email // Include email for UI display
    });
  } catch (error) {
    console.error('Error verifying reset token:', error);
    return NextResponse.json(
      { message: 'Failed to verify token' },
      { status: 500 }
    );
  }
} 