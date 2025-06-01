const express = require("express");
const { auth } = require("../auth");
const router = express.Router();

// Helper function to check session
const checkSession = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });

    if (!session?.user?.id) {
      return res.status(401).json({ error: "No valid session found" });
    }

    req.session = session; // Store session for route handlers to use
    next();
  } catch (error) {
    console.error("Session error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};

// Create API key
router.post("/create", checkSession, async (req, res) => {
  try {
    const apiKey = await auth.api.createApiKey({
      body: {
        name: req.body.name || "Default Key",
        userId: req.session.user.id,
        remaining: 100,
        rateLimitEnabled: true,
        rateLimitTimeWindow: 1000 * 60 * 60 * 24, // 1 day
        rateLimitMax: 1000, // 1000 requests per day
      },
      headers: req.headers
    });

    res.json({ apiKey });
  } catch (error) {
    console.error("Error creating API key:", error);
    res.status(500).json({ error: error.message });
  }
});

// List API keys
router.get("/list", checkSession, async (req, res) => {
  try {
    const apiKeys = await auth.api.listApiKeys({
      headers: req.headers
    });

    res.json({ apiKeys });
  } catch (error) {
    console.error("Error listing API keys:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific API key
router.get("/:keyId", checkSession, async (req, res) => {
  try {
    const apiKey = await auth.api.getApiKey({
      body: {
        keyId: req.params.keyId
      },
      headers: req.headers
    });

    res.json({ apiKey });
  } catch (error) {
    console.error("Error getting API key:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update API key
router.patch("/:keyId", checkSession, async (req, res) => {
  try {
    // Create base body with mandatory keyId
    const updateBody = { keyId: req.params.keyId };
    
    // List of optional fields
    const optionalFields = [
      'name',
      'enabled',
      'rateLimitEnabled',
      'rateLimitTimeWindow',
      'rateLimitMax'
    ];
    
    // Add optional fields only if they exist in request body
    optionalFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateBody[field] = req.body[field];
      }
    });

    const apiKey = await auth.api.updateApiKey({
      body: updateBody,
      headers: req.headers
    });

    res.json({ apiKey });
  } catch (error) {
    console.error("Error updating API key:", error);
    res.status(500).json({ error: error.message });
  }
});
// router.patch("/:keyId", checkSession, async (req, res) => {
//   try {
//     const apiKey = await auth.api.updateApiKey({
//       body: {
//         keyId: req.params.keyId,
//         name: req.body.name,
//         enabled: req.body.enabled,
//         rateLimitEnabled: req.body.rateLimitEnabled,
//         rateLimitTimeWindow: req.body.rateLimitTimeWindow,
//         rateLimitMax: req.body.rateLimitMax
//       },
//       headers: req.headers
//     });

//     res.json({ apiKey });
//   } catch (error) {
//     console.error("Error updating API key:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// Delete API key
router.delete("/:keyId", checkSession, async (req, res) => {
  try {
    const result = await auth.api.deleteApiKey({
      body: {
        keyId: req.params.keyId
      },
      headers: req.headers
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting API key:", error);
    res.status(500).json({ error: error.message });
  }
});

// Verify API key
router.post("/verify", async (req, res) => {
  try {
    const { valid, error, key } = await auth.api.verifyApiKey({
      body: {
        key: req.body.key,
        permissions: req.body.permissions
      },
      headers: req.headers
    });

    res.json({ valid, error, key });
  } catch (error) {
    console.error("Error verifying API key:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;