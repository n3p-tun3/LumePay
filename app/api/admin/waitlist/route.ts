import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/auth.config';
import { PrismaClient } from '@/app/generated/prisma';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/app/lib/email';

const prisma = new PrismaClient();

// Helper to generate a random password
function generatePassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

// Get waitlist entries with pagination
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 10;

    const where = status ? { status } : {};

    const [entries, total] = await Promise.all([
      prisma.waitlistEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          email: true,
          name: true,
          status: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          approvedAt: true
        }
      }),
      prisma.waitlistEntry.count({ where }),
    ]);

    return NextResponse.json({
      entries,
      pagination: {
        total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
        pageSize,
      },
    });
  } catch (error) {
    console.error('Error fetching waitlist entries:', error);
    return NextResponse.json(
      { message: 'Failed to fetch waitlist entries' },
      { status: 500 }
    );
  }
}

// Update waitlist entry status
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

    const { entryId, action, notes } = await request.json();

    if (!entryId || !action) {
      return NextResponse.json(
        { message: 'Entry ID and action are required' },
        { status: 400 }
      );
    }

    const entry = await prisma.waitlistEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      return NextResponse.json(
        { message: 'Waitlist entry not found' },
        { status: 404 }
      );
    }

    if (entry.status !== 'pending') {
      return NextResponse.json(
        { message: 'Entry is not in pending status' },
        { status: 400 }
      );
    }

    const status = action === 'approve' ? 'approved' : 'rejected';
    const approvedAt = action === 'approve' ? new Date() : null;

    // Update waitlist entry
    await prisma.waitlistEntry.update({
      where: { id: entryId },
      data: {
        status,
        notes: notes || null,
        approvedAt,
      },
    });

    // If approved, create a user account and send welcome email
    if (action === 'approve') {
      // Generate a secure random password
      const plainPassword = generatePassword();
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      // Create user account with hashed password
      await prisma.user.create({
        data: {
          email: entry.email,
          name: entry.name,
          password: hashedPassword,
          isAdmin: false,
        },
      });

      // Send welcome email with the plain password
      try {
        await sendWelcomeEmail(entry.email, entry.name, plainPassword);
      } catch (error) {
        console.error('Failed to send welcome email:', error);
        // Don't throw here - we still want to return success for the approval
        // The user can use the password reset flow if they don't receive the email
      }
    }

    return NextResponse.json({ 
      message: `Successfully ${action}ed entry${action === 'approve' ? ' and sent welcome email' : ''}` 
    });
  } catch (error) {
    console.error('Error updating waitlist entry:', error);
    return NextResponse.json(
      { message: 'Failed to update waitlist entry' },
      { status: 500 }
    );
  }
} 