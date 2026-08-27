const express = require('express');
const router = express.Router();
const { rfqUpload } = require('../middleware/upload.middleware');
const { rfqRateLimiter } = require('../middleware/rateLimiter.middleware');
const { submitRFQ } = require('../controllers/rfq.controller');

/**
 * @route   POST /api/rfq
 * @desc    Submit a B2B Request for Quotation with supporting CAD/document attachments
 * @access  Public (Rate limited, honeypot protected)
 */
router.post('/', rfqRateLimiter, (req, res, next) => {
  // Wrap multer middleware to catch multer-specific payload errors gracefully
  rfqUpload.array('files', 5)(req, res, (err) => {
    if (err) {
      console.warn('File upload validation error:', err.message);
      return res.status(400).json({
        success: false,
        error: {
          message: err.message || 'File upload validation failed.',
          code: 'FILE_UPLOAD_ERROR',
        },
      });
    }
    next();
  });
}, submitRFQ);

module.exports = router;
