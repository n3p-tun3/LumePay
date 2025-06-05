import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if waitlist is enabled
    const setting = await prisma.systemSettings.findUnique({
      where: { key: 'waitlist_enabled' },
      select: { value: true },
    });

    if (!setting?.value) {
      return NextResponse.json(
        { message: 'Waitlist is not currently enabled' },
        { status: 400 }
      );
    }

    // Check if email already exists in waitlist
    const existingEntry = await prisma.waitlistEntry.findUnique({
      where: { email },
    });

    if (existingEntry) {
      return NextResponse.json(
        { message: 'You are already on the waitlist' },
        { status: 400 }
      );
    }

    // Check if email is already registered as a user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'This email is already registered' },
        { status: 400 }
      );
    }

    // Create waitlist entry
    await prisma.waitlistEntry.create({
      data: {
        email,
        name: name || null,
        status: 'pending',
      },
    });

    return NextResponse.json({ message: 'Successfully joined the waitlist' });
  } catch (error) {
    console.error('Error joining waitlist:', error);
    return NextResponse.json(
      { message: 'Failed to join waitlist' },
      { status: 500 }
    );
  }
} 