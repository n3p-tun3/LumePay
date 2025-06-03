import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/auth.config';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

// Change from default export to named export
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Get user's API key
    const apiKey = await prisma.apiKey.findFirst({
      where: { userId: user.id },
      select: { remainingCredits: true }
    });

    // Get payment statistics
    const [totalPayments, successfulPayments, pendingPayments] = await Promise.all([
      // Total payments
      prisma.intent.count({
        where: { userId: user.id }
      }),
      // Successful payments
      prisma.intent.count({
        where: { 
          userId: user.id,
          status: 'completed'
        }
      }),
      // Pending payments
      prisma.intent.count({
        where: { 
          userId: user.id,
          status: { in: ['pending', 'processing'] }
        }
      })
    ]);

    return NextResponse.json({
      totalPayments,
      successfulPayments,
      pendingPayments,
      apiKeyCredits: apiKey?.remainingCredits || 0
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 