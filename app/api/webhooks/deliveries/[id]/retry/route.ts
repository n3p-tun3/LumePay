import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/auth.config';
import { PrismaClient } from '@/app/generated/prisma';
import { webhookService } from '@/app/lib/webhook';

const prisma = new PrismaClient();

// Retry a failed webhook delivery
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the delivery record
    const delivery = await prisma.webhookDelivery.findUnique({
      where: { id: params.id },
      include: {
        payment: true
      }
    });

    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }

    if (delivery.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (delivery.status === 'success') {
      return NextResponse.json({ 
        error: "Cannot retry a successful delivery" 
      }, { status: 400 });
    }

    // Get user's webhook settings
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { webhookSettings: true }
    });

    if (!user?.webhookSettings?.enabled || !user?.webhookSettings?.url) {
      return NextResponse.json({ 
        error: "Webhook is not configured" 
      }, { status: 400 });
    }

    // Retry the webhook
    if (delivery.payment) {
      await webhookService.sendWebhook(session.user.id, delivery.payment);
    }

    return NextResponse.json({ 
      message: "Webhook retry initiated" 
    });
  } catch (error: any) {
    console.error('Error retrying webhook:', error);
    return NextResponse.json({ 
      error: "Failed to retry webhook",
      details: error.message 
    }, { status: 500 });
  }
}