import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/auth.config';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

// Get webhook delivery history
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deliveries = await prisma.webhookDelivery.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 deliveries
      include: {
        payment: {
          select: {
            amount: true,
            status: true,
            transactionId: true
          }
        }
      }
    });

    return NextResponse.json({ deliveries });
  } catch (error: any) {
    console.error('Error fetching webhook deliveries:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 