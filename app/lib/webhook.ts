import { PrismaClient } from '@/app/generated/prisma';
import crypto from 'crypto';
import axios from 'axios';

const prisma = new PrismaClient();

export const WEBHOOK_EVENTS = {
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed'
} as const;

type WebhookEvent = typeof WEBHOOK_EVENTS[keyof typeof WEBHOOK_EVENTS];

interface WebhookPayload {
  event: WebhookEvent;
  data: {
    paymentId: string;
    amount: number;
    status: string;
    transactionId: string;
    verificationData?: any;
    createdAt: Date;
    errorReason?: string;
  };
  timestamp: string;
}

class WebhookService {
  private maxRetries = 3;
  private retryDelays = [5, 15, 30]; // Delays in seconds

  // Create signature for payload
  private createSignature(payload: WebhookPayload, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  // Prepare webhook payload
  private preparePayload(payment: any): WebhookPayload {
    return {
      event: payment.status === 'failed' ? WEBHOOK_EVENTS.PAYMENT_FAILED : WEBHOOK_EVENTS.PAYMENT_COMPLETED,
      data: {
        paymentId: payment.id,
        amount: payment.amount,
        status: payment.status,
        transactionId: payment.transactionId,
        verificationData: payment.verificationData,
        createdAt: payment.createdAt,
        errorReason: payment.status === 'failed' ? payment.errorReason : undefined
      },
      timestamp: new Date().toISOString()
    };
  }

  // Send webhook with retries
  async sendWebhook(userId: string, payment: any, attempt = 0): Promise<void> {
    try {
      // Get user's webhook config
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { webhookSettings: true }
      });

      if (!user?.webhookSettings?.enabled || !user?.webhookSettings?.url || !user?.webhookSettings?.secret) {
        return;
      }

      // Check if event is subscribed to
      if (!user.webhookSettings.subscriptions.includes(
        payment.status === 'failed' ? WEBHOOK_EVENTS.PAYMENT_FAILED : WEBHOOK_EVENTS.PAYMENT_COMPLETED
      )) {
        return;
      }

      const payload = this.preparePayload(payment);
      const signature = this.createSignature(payload, user.webhookSettings.secret);

      // Send webhook
      const response = await axios.post(user.webhookSettings.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Timestamp': payload.timestamp
        },
        timeout: 10000 // 10 second timeout
      });

      // Record successful delivery
      await prisma.webhookDelivery.create({
        data: {
          userId,
          paymentId: payment.id,
          status: 'success',
          statusCode: response.status,
          attempts: attempt + 1
        }
      });

    } catch (error: any) {
      // Record failed delivery
      await prisma.webhookDelivery.create({
        data: {
          userId,
          paymentId: payment.id,
          status: 'failed',
          statusCode: error.response?.status,
          error: error.message,
          attempts: attempt + 1
        }
      });

      // Retry if we haven't exceeded max attempts
      if (attempt < this.maxRetries) {
        const delay = this.retryDelays[attempt] * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.sendWebhook(userId, payment, attempt + 1);
      }
    }
  }

  // Verify webhook signature (for merchants to verify incoming webhooks)
  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}

export const webhookService = new WebhookService(); 