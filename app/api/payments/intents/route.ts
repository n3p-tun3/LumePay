import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/auth.config';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const status = searchParams.get('status');

    // Build where clause
    const where = {
      userId: user.id,
      ...(status ? { status } : {})
    };

    // Get total count for pagination
    const total = await prisma.intent.count({ where });

    // Get payment intents
    const intents = await prisma.intent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true,
        amount: true,
        status: true,
        customerEmail: true,
        createdAt: true,
        metadata: true,
        payment: {
          select: {
            transactionId: true,
            verificationData: true
          }
        }
      }
    });

    return NextResponse.json({
      intents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching payment intents:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 