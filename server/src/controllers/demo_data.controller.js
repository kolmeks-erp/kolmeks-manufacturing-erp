const demoDataService = require('../services/demo_data.service');

/**
 * Controller for Demo Data Management Operations
 */
exports.getStatus = async (req, res) => {
  try {
    const result = await demoDataService.getStatus();
    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }
    return res.status(200).json(result);
  } catch (err) {
    console.error('Error in demo_data.controller getStatus:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

exports.createDemoData = async (req, res) => {
  try {
    const result = await demoDataService.createDemoData(req.user);
    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }
    return res.status(200).json(result);
  } catch (err) {
    console.error('Error in demo_data.controller createDemoData:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

exports.deleteDemoData = async (req, res) => {
  try {
    const result = await demoDataService.deleteDemoData(req.user);
    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }
    return res.status(200).json(result);
  } catch (err) {
    console.error('Error in demo_data.controller deleteDemoData:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
