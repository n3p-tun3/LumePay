const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { auth } = require('../auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { WEBHOOK_EVENTS } = require('../constants/webhookEvents');

// Helper to validate webhook URL
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Generate webhook secret
const generateWebhookSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Get webhook configuration
router.get('/config', async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        webhookSettings: true
      }
    });

    res.json({
      webhookSettings: user.webhookSettings || {
        enabled: false,
        url: null,
        secret: null
      }
    });
  } catch (error) {
    console.error('Error fetching webhook config:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update webhook configuration
// In the POST /config route
router.post('/config', async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { url, enabled, subscriptions = ['payment.completed'] } = req.body;

    // Validate subscriptions
    const validSubscriptions = subscriptions.every(
      sub => Object.values(WEBHOOK_EVENTS).includes(sub)
    );

    if (!validSubscriptions) {
      return res.status(400).json({ 
        error: "Invalid subscription. Available events: payment.completed, payment.failed" 
      });
    }

    // Validate URL if provided
    if (url && !isValidUrl(url)) {
      return res.status(400).json({ error: "Invalid webhook URL" });
    }

    // Get current settings
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        webhookSettings: true
      }
    });

    const currentSettings = user.webhookSettings || {};
    
    // Generate new secret if url changed or no secret exists
    const secret = url !== currentSettings.url ? 
      generateWebhookSecret() : 
      currentSettings.secret || generateWebhookSecret();

    // Update webhook settings
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        webhookSettings: {
          url: url || currentSettings.url,
          secret,
          enabled: enabled ?? currentSettings.enabled ?? false
        }
      },
      select: {
        webhookSettings: true
      }
    });

    res.json({ webhookSettings: updatedUser.webhookSettings });
  } catch (error) {
    console.error('Error updating webhook config:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get webhook delivery history
router.get('/deliveries', async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
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

    res.json({ deliveries });
  } catch (error) {
    console.error('Error fetching webhook deliveries:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
