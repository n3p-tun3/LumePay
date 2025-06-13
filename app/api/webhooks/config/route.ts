import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/auth.config';
import { PrismaClient } from '@/app/generated/prisma';
import crypto from 'crypto';
import { WEBHOOK_EVENTS } from '@/app/lib/webhook';

const prisma = new PrismaClient();

// Helper to validate webhook URL
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Generate webhook secret
function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Get webhook configuration
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { webhookSettings: true }
    });

    return NextResponse.json({
      webhookSettings: user?.webhookSettings || {
        enabled: false,
        url: null,
        secret: null,
        subscriptions: [WEBHOOK_EVENTS.PAYMENT_COMPLETED, WEBHOOK_EVENTS.PAYMENT_FAILED]
      }
    });
  } catch (error: any) {
    console.error('Error fetching webhook config:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update webhook configuration
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url, enabled, subscriptions = [WEBHOOK_EVENTS.PAYMENT_COMPLETED, WEBHOOK_EVENTS.PAYMENT_FAILED] } = await request.json();

    // Validate subscriptions
    const validSubscriptions = subscriptions.every(
      (sub: string) => Object.values(WEBHOOK_EVENTS).includes(sub as any)
    );

    if (!validSubscriptions) {
      return NextResponse.json({ 
        error: "Invalid subscription. Available events: payment.completed, payment.failed" 
      }, { status: 400 });
    }

    // Validate URL if provided
    if (url && !isValidUrl(url)) {
      return NextResponse.json({ error: "Invalid webhook URL" }, { status: 400 });
    }

    // Get current settings
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { webhookSettings: true }
    });

    const currentSettings = user?.webhookSettings;
    
    // Generate new secret if url changed or no secret exists
    const secret = url !== currentSettings?.url ? 
      generateWebhookSecret() : 
      currentSettings?.secret || generateWebhookSecret();

    // Update webhook settings
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        webhookSettings: {
          upsert: {
            create: {
              url: url || null,
              secret,
              enabled: enabled ?? false,
              subscriptions: subscriptions as any[]
            },
            update: {
              url: url || currentSettings?.url,
              secret,
              enabled: enabled ?? currentSettings?.enabled ?? false,
              subscriptions: subscriptions as any[]
            }
          }
        }
      },
      include: {
        webhookSettings: true
      }
    });

    return NextResponse.json({ webhookSettings: updatedUser.webhookSettings });
  } catch (error: any) {
    console.error('Error updating webhook config:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 