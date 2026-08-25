const express = require('express');
const router = express.Router();
const dbService = require('../services/db.service');

/**
 * GET /api/health
 * Public health check and telemetry endpoint
 */
router.get('/health', async (req, res) => {
  const dbHealth = await dbService.checkDatabaseHealth();

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
      connected: dbHealth.connected,
      status: dbHealth.status,
      message: dbHealth.message,
    },
  });
});

module.exports = router;
