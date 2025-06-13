const axios = require('axios');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class WebhookService {
  constructor() {
    this.maxRetries = 3;
    this.retryDelays = [5, 15, 30]; // Delays in seconds
  }

  // Create signature for payload
  createSignature(payload, secret) {
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  // Prepare webhook payload
  preparePayload(payment) {
    return {
      event: payment.status === 'failed' ? 'payment.failed' : 'payment.completed',
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
  async sendWebhook(userId, payment, attempt = 0) {
    try {
      // Get user's webhook config
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { webhookSettings: true }
      });

      if (!user?.webhookSettings?.enabled || !user?.webhookSettings?.url) {
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

    } catch (error) {
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
}

module.exports = new WebhookService();
