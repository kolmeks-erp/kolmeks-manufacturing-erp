const activityService = require('../services/activity.service');

class ActivityController {
  async getActivity(req, res, next) {
    try {
      const userRole = req.role?.name || 'staff';
      const userProfile = req.profile || {};

      const data = await activityService.getActivityStream(req.query, userRole, userProfile);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ActivityController();
