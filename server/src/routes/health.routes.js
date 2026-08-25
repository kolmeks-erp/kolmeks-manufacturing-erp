const express = require('express');
const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint verifying Express backend operation & system status.
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'online',
    service: 'Kolmeks Manufacturing API Backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
    database: {
      provider: 'Supabase PostgreSQL',
      status: 'configured',
    },
  });
});

module.exports = router;
