import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/app/lib/email';

const prisma = new PrismaClient();

// Helper to generate a secure token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal that the user doesn't exist
      return NextResponse.json({ 
        message: 'If an account exists with this email, you will receive password reset instructions.' 
      });
    }

    // Generate a secure token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Store the token in the database
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Send the reset email
    try {
      await sendPasswordResetEmail(user.email, user.name, token);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Delete the token if email fails
      await prisma.passwordResetToken.delete({
        where: { token },
      });
      throw new Error('Failed to send reset email');
    }

    return NextResponse.json({ 
      message: 'If an account exists with this email, you will receive password reset instructions.' 
    });
  } catch (error) {
    console.error('Error processing password reset request:', error);
    return NextResponse.json(
      { message: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
} 