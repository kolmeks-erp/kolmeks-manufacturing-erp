const express = require('express');
const router = express.Router();
const { rfqUpload } = require('../middleware/upload.middleware');
const { rfqRateLimiter } = require('../middleware/rateLimiter.middleware');
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');
const rfqController = require('../controllers/rfq.controller');

// Authorized ERP Roles for RFQ Management
const AUTHORIZED_ROLES = ['admin', 'sales_manager', 'executive', 'production_manager'];

// ==============================================================================
// 1. PUBLIC RFQ SUBMISSION ENDPOINT (PROMPT 11)
// ==============================================================================
/**
 * @route   POST /api/rfq
 * @desc    Submit a B2B Request for Quotation with supporting CAD/document attachments
 * @access  Public (Rate limited, honeypot protected)
 */
router.post('/', rfqRateLimiter, (req, res, next) => {
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
}, rfqController.submitRFQ);

// ==============================================================================
// 2. SECURE INTERNAL ERP RFQ MANAGEMENT ENDPOINTS (PROMPT 17)
// ==============================================================================
const erpRouter = express.Router();
erpRouter.use(authenticateUser);
erpRouter.use(authorizeRoles(...AUTHORIZED_ROLES));

erpRouter.get('/', rfqController.getRFQs);
erpRouter.get('/:id', rfqController.getRFQById);
erpRouter.patch('/:id/status', rfqController.updateRFQStatus);
erpRouter.patch('/:id/assignment', rfqController.updateRFQAssignment);
erpRouter.patch('/:id/customer', rfqController.linkCustomer);
erpRouter.patch('/:id/product', rfqController.linkProduct);
erpRouter.get('/:id/notes', rfqController.getNotes);
erpRouter.post('/:id/notes', rfqController.createNote);
erpRouter.get('/:id/activity', rfqController.getActivity);

module.exports = {
  publicRouter: router,
  erpRouter: erpRouter,
};
