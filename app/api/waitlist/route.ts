import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import { getSetting } from '../admin/settings/route';

const prisma = new PrismaClient();

// GET /api/waitlist/status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return new NextResponse('Email is required', { status: 400 });
    }

    // Check if waitlist is enabled
    const waitlistEnabled = await getSetting('waitlist_enabled');
    if (!waitlistEnabled) {
      return NextResponse.json({ enabled: false });
    }

    // Check if user is already on waitlist
    const entry = await prisma.waitlistEntry.findUnique({
      where: { email }
    });

    if (!entry) {
      return NextResponse.json({ 
        enabled: true,
        status: 'not_found'
      });
    }

    return NextResponse.json({
      enabled: true,
      status: entry.status,
      approved: entry.status === 'approved',
      createdAt: entry.createdAt
    });
  } catch (error) {
    console.error('Error checking waitlist status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST /api/waitlist/join
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return new NextResponse('Email is required', { status: 400 });
    }

    // Check if waitlist is enabled
    const waitlistEnabled = await getSetting('waitlist_enabled');
    if (!waitlistEnabled) {
      return new NextResponse('Waitlist is not enabled', { status: 400 });
    }

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return new NextResponse('Email already registered', { status: 400 });
    }

    // Check if already on waitlist
    const existingEntry = await prisma.waitlistEntry.findUnique({
      where: { email }
    });

    if (existingEntry) {
      return NextResponse.json({
        message: 'Already on waitlist',
        status: existingEntry.status
      });
    }

    // Add to waitlist
    const entry = await prisma.waitlistEntry.create({
      data: {
        email,
        name,
        status: 'pending'
      }
    });

    return NextResponse.json({
      message: 'Successfully joined waitlist',
      status: entry.status
    });
  } catch (error) {
    console.error('Error joining waitlist:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 