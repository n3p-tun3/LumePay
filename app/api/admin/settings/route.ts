import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/auth.config';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

// Helper to get a setting
export async function getSetting(key: string) {
  const setting = await prisma.systemSettings.findUnique({
    where: { key }
  });
  return setting?.value;
}

// Helper to set a setting
async function setSetting(key: string, value: any, description: string | null = null) {
  await prisma.systemSettings.upsert({
    where: { key },
    update: { value, description },
    create: {
      key,
      value,
      description,
    },
  });
}

// Get all system settings
export async function GET(request: Request) {
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

    const settings = await prisma.systemSettings.findMany({
      orderBy: { key: 'asc' },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { message: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// Update a system setting
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

    const { key, value } = await request.json();

    if (!key) {
      return NextResponse.json(
        { message: 'Setting key is required' },
        { status: 400 }
      );
    }

    // Update or create setting
    const setting = await prisma.systemSettings.upsert({
      where: { key },
      update: { value },
      create: {
        key,
        value,
        description: null,
      },
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json(
      { message: 'Failed to update setting' },
      { status: 500 }
    );
  }
}

interface SystemSetting {
  key: string;
  value: any;
  description: string | null;
}

// Initialize default settings if they don't exist
export async function initializeSettings() {
  const defaultSettings: SystemSetting[] = [
    // Add any non-waitlist settings here
  ];

  for (const setting of defaultSettings) {
    await setSetting(setting.key, setting.value, setting.description);
  }
} 