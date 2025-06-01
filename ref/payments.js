// routes/payments.js
const express = require("express");
const router = express.Router();
const { auth } = require("../auth");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const axios = require('axios');
const webhookService = require('../services/webhookService');

// Helper function to check session (same as in apiKeys.js)
const checkSession = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });

    if (!session?.user?.id) {
      return res.status(401).json({ error: "No valid session found" });
    }

    req.session = session;
    next();
  } catch (error) {
    console.error("Session error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};

const verifyApiKey = async (req, res, next) => {
  try {
    const apiKey = await auth.api.verifyApiKey({
      body: {
        key: req.headers['x-api-key']
      },
      headers: req.headers
    });

    if (!apiKey) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    req.apiKey = apiKey;
    next();
  } catch (error) {
    console.error("API key error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};

// Create a payment intent
router.post("/intent/create", verifyApiKey, async (req, res) => {
  try {
    const { amount, customerEmail, metadata } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    const userId = req.apiKey.key.userId;
    console.log(userId);

    const intent = await prisma.intent.create({
      data: {
        userId: userId,
        amount,
        customerEmail,
        metadata,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes expiry
      }
    });

    res.json({ intent });
    // res.json({ success: true });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get intent details (public route for customers)
router.get("/intent/:intentId", async (req, res) => {
  try {
    const intent = await prisma.intent.findUnique({
      where: { id: req.params.intentId },
      select: {
        id: true,
        amount: true,
        status: true,
        customerEmail: true,
        createdAt: true,
        expiresAt: true
      }
    });

    if (!intent) {
      return res.status(404).json({ error: "Intent not found" });
    }

    res.json({ intent });
  } catch (error) {
    console.error("Error fetching intent:", error);
    res.status(500).json({ error: error.message });
  }
});

// Verification service config
const VERIFICATION_SERVICE_URL = process.env.VERIFICATION_SERVICE_URL || 'http://localhost:8000';

// Helper to check if user has valid bank details
const validateMerchantBankDetails = (settings) => {
  if (!settings || !settings.bankAccount || !settings.bankName) {
    throw new Error('Merchant bank details not configured');
  }
  // For now we only support CBE
  if (settings.bankName !== 'CBE') {
    throw new Error('Only CBE bank is supported at the moment');
  }
};

// Submit payment for an intent
router.post("/intent/:intentId/pay", verifyApiKey, async (req, res) => {
  try {
    const { transactionId } = req.body;
    const intentId = req.params.intentId;

    if (!transactionId) {
      return res.status(400).json({ error: "Transaction ID is required" });
    }

    // Check if transaction ID has been used before
    const existingPayment = await prisma.payment.findFirst({
      where: {
        transactionId,
        status: "completed"
      }
    });


    if (existingPayment) {
      return res.status(400).json({ 
        error: "This transaction ID has already been used for another payment" 
      });
    }

    // Get intent with merchant details
    const intent = await prisma.intent.findUnique({
      where: { id: intentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            settings: true
          }
        }
      }
    });

    if (!intent) {
      return res.status(404).json({ error: "Intent not found" });
    }

    if (intent.status !== "pending") {
      return res.status(400).json({ error: "Intent is no longer pending" });
    }

    // Check if intent has expired
    // if (intent.expiredAt < new Date()) {
    //   return res.status(400).json({ error: "Intent has expired" });
    // }

    // Validate merchant bank details
    try {
      validateMerchantBankDetails(intent.user.settings);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    // Call verification service with amount and creation time
    const verificationResponse = await axios.post(`${VERIFICATION_SERVICE_URL}/verify`, {
      transaction_id: transactionId,
      expected_receiver_name: intent.user.name,
      expected_receiver_account: intent.user.settings.bankAccount,
      expected_amount: intent.amount,
      intent_created_at: intent.createdAt.toISOString()
    }, {timeout: 60000});

    const verificationResult = verificationResponse.data;

    if (!verificationResult.success) {
      return res.status(400).json({
        error: "Payment verification failed",
        message: verificationResult.message
      });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: intent.userId,
        intentId: intent.id,
        amount: parseFloat(verificationResult.details.amount),
        transactionId,
        status: "completed",
        verificationData: {
          payer: verificationResult.details.payer,
          amount: verificationResult.details.amount,
          date: verificationResult.details.date,
          receiver: verificationResult.details.receiver
        }
      }
    });

    // Trigger webhook asynchronously
    webhookService.sendWebhook(intent.userId, payment).catch(error => {
      console.error('Webhook delivery error:', error);
    });

    // Update intent status
    await prisma.intent.update({
      where: { id: intent.id },
      data: { status: "completed" }
    });

    res.json({ 
      success: true,
      payment,
      verificationDetails: verificationResult.details
    });

  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ error: error.message });
  }
});

// List intents for merchant
router.get("/intents", checkSession, async (req, res) => {
  try {
    const intents = await prisma.intent.findMany({
      where: { userId: req.session.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ intents });
  } catch (error) {
    console.error("Error listing intents:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;