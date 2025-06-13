import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/auth.config';
import { PrismaClient } from '@/app/generated/prisma';
import { webhookService } from '@/app/lib/webhook';

const prisma = new PrismaClient();

// Send a test webhook
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's webhook settings
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { webhookSettings: true }
    });

    if (!user?.webhookSettings?.enabled || !user?.webhookSettings?.url) {
      return NextResponse.json({ 
        error: "Webhook is not configured. Please enable webhooks and set a URL." 
      }, { status: 400 });
    }

    // Create a test payment record
    const testPayment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        intentId: 'test-' + Date.now(), // Temporary intent ID
        amount: 100, // Test amount
        transactionId: 'test-' + Date.now(), // Temporary transaction ID
        status: 'completed',
        verificationData: {
          test: true,
          timestamp: new Date().toISOString()
        }
      }
    });

    try {
      // Send the test webhook
      await webhookService.sendWebhook(session.user.id, testPayment);

      // Clean up test payment
      await prisma.payment.delete({
        where: { id: testPayment.id }
      });

      return NextResponse.json({ 
        message: "Test webhook sent successfully" 
      });
    } catch (error: any) {
      // Clean up test payment even if webhook fails
      await prisma.payment.delete({
        where: { id: testPayment.id }
      });
      throw error;
    }
  } catch (error: any) {
    console.error('Error sending test webhook:', error);
    return NextResponse.json({ 
      error: "Failed to send test webhook",
      details: error.message 
    }, { status: 500 });
  }
}