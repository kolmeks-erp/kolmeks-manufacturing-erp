const searchService = require('../services/search.service');

class SearchController {
  async search(req, res, next) {
    try {
      const { q } = req.query;
      const userRole = req.role?.name || 'staff';
      const userProfile = req.profile || {};

      const data = await searchService.performGlobalSearch(q, userRole, userProfile);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SearchController();
