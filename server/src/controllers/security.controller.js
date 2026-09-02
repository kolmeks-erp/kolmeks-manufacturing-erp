const securityService = require('../services/security.service');

class SecurityController {
  async getOverview(req, res, next) {
    try {
      const data = await securityService.getSecurityOverviewMetrics();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getAccessControl(req, res, next) {
    try {
      const data = await securityService.getAccessControlRecords(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const currentAdminId = req.user.id;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

      if (!status || !['active', 'suspended', 'inactive'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid user status parameter.' });
      }

      const updated = await securityService.updateUserStatus(id, status, currentAdminId, ipAddress);
      res.status(200).json({ success: true, data: updated, message: `User status successfully updated to '${status}'.` });
    } catch (err) {
      next(err);
    }
  }

  async getSessions(req, res, next) {
    try {
      const data = await securityService.getUserSessions(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async revokeSession(req, res, next) {
    try {
      const { id } = req.params;
      const currentAdminId = req.user.id;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

      const revoked = await securityService.revokeUserSession(id, currentAdminId, ipAddress);
      res.status(200).json({ success: true, data: revoked, message: 'Session successfully revoked.' });
    } catch (err) {
      next(err);
    }
  }

  async getEvents(req, res, next) {
    try {
      const data = await securityService.getSecurityEvents(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getPolicies(req, res, next) {
    try {
      const data = await securityService.getSecurityPolicies();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async updatePolicy(req, res, next) {
    try {
      const { key } = req.params;
      const { value } = req.body;
      const currentAdminId = req.user.id;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

      if (!value) {
        return res.status(400).json({ success: false, error: 'Policy value object is required.' });
      }

      const updated = await securityService.updateSecurityPolicy(key, value, currentAdminId, ipAddress);
      res.status(200).json({ success: true, data: updated, message: 'Security policy updated successfully.' });
    } catch (err) {
      next(err);
    }
  }

  async getAuditTrail(req, res, next) {
    try {
      const data = await securityService.getAuditTrailLogs(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SecurityController();
