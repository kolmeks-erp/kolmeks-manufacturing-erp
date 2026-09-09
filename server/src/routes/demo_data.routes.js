const express = require('express');
const router = express.Router();
const demoDataController = require('../controllers/demo_data.controller');

// GET /api/system/demo-data/status - Check demo dataset status & record counts
router.get('/status', demoDataController.getStatus);

// POST /api/system/demo-data/create - Create demo dataset
router.post('/create', demoDataController.createDemoData);

// DELETE /api/system/demo-data/delete - Delete demo dataset safely
router.delete('/delete', demoDataController.deleteDemoData);

module.exports = router;
