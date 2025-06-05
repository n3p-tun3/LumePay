import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../../auth/auth.config';
import { PrismaClient } from '@/app/generated/prisma';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// GET /api/admin/waitlist/config
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get the current waitlist status from the database
    const setting = await prisma.systemSettings.findUnique({
      where: { key: 'waitlist_enabled' },
      select: { value: true },
    });

    return NextResponse.json({
      enabled: setting?.value?.enabled ?? true,
      message: setting?.value?.message ?? 'We are currently in private beta. Join our waitlist to get early access!'
    });
  } catch (error) {
    console.error('Error fetching waitlist config:', error);
    return NextResponse.json(
      { message: 'Failed to fetch waitlist config' },
      { status: 500 }
    );
  }
}

// POST /api/admin/waitlist/config
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { enabled, message } = await request.json();

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { message: 'Enabled status is required and must be a boolean' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { message: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Update the database setting
    await prisma.systemSettings.upsert({
      where: { key: 'waitlist_enabled' },
      update: {
        value: { enabled, message },
        updatedAt: new Date(),
        updatedBy: session.user.email,
      },
      create: {
        key: 'waitlist_enabled',
        value: { enabled, message },
        updatedAt: new Date(),
        updatedBy: session.user.email,
        description: 'Controls whether the waitlist is enabled and its message',
      },
    });

    // Update the static config file
    const configPath = path.join(process.cwd(), 'app/config/waitlist.json');
    await fs.writeFile(
      configPath,
      JSON.stringify({ enabled, message }, null, 2)
    );

    return NextResponse.json({ 
      message: 'Waitlist configuration updated successfully',
      config: { enabled, message }
    });
  } catch (error) {
    console.error('Error updating waitlist config:', error);
    return NextResponse.json(
      { message: 'Failed to update waitlist config' },
      { status: 500 }
    );
  }
} 