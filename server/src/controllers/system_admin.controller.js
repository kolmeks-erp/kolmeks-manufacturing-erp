const systemAdminService = require('../services/system_admin.service');

// 1. Dashboard Telemetry & System Health
const getDashboardTelemetry = async (req, res) => {
  try {
    const data = await systemAdminService.getDashboardTelemetry();
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getDashboardTelemetry error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Organization Settings
const getOrganizationProfile = async (req, res) => {
  try {
    const data = await systemAdminService.getOrganizationProfile();
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getOrganizationProfile error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateOrganizationProfile = async (req, res) => {
  try {
    const actorId = req.user?.id || null;
    const data = await systemAdminService.updateOrganizationProfile(req.body, actorId);
    return res.json({ success: true, data, message: 'Organization profile updated successfully.' });
  } catch (err) {
    console.error('updateOrganizationProfile error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Locations
const getLocations = async (req, res) => {
  try {
    const data = await systemAdminService.getLocations();
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getLocations error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const saveLocation = async (req, res) => {
  try {
    const actorId = req.user?.id || null;
    const data = await systemAdminService.saveLocation(req.body, actorId);
    return res.json({ success: true, data, message: 'Location saved successfully.' });
  } catch (err) {
    console.error('saveLocation error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Departments
const getDepartments = async (req, res) => {
  try {
    const data = await systemAdminService.getDepartments();
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getDepartments error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const saveDepartment = async (req, res) => {
  try {
    const actorId = req.user?.id || null;
    const data = await systemAdminService.saveDepartment(req.body, actorId);
    return res.json({ success: true, data, message: 'Department saved successfully.' });
  } catch (err) {
    console.error('saveDepartment error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 5. Users
const getUsers = async (req, res) => {
  try {
    const data = await systemAdminService.getUsers();
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getUsers error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const actorId = req.user?.id || null;
    const data = await systemAdminService.updateUserStatus(id, status, actorId);
    return res.json({ success: true, data, message: `User status set to ${status}` });
  } catch (err) {
    console.error('updateUserStatus error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { roleId } = req.body;
    const actorId = req.user?.id || null;
    const data = await systemAdminService.updateUserRole(id, roleId, actorId);
    return res.json({ success: true, data, message: 'User role updated successfully.' });
  } catch (err) {
    console.error('updateUserRole error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 6. Roles & Permissions
const getRoles = async (req, res) => {
  try {
    const data = await systemAdminService.getRoles();
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getRoles error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const saveRole = async (req, res) => {
  try {
    const actorId = req.user?.id || null;
    const data = await systemAdminService.saveRole(req.body, actorId);
    return res.json({ success: true, data, message: 'Role saved successfully.' });
  } catch (err) {
    console.error('saveRole error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getPermissions = async (req, res) => {
  try {
    const data = await systemAdminService.getPermissions();
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getPermissions error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 7. Numbering Sequences
const getNumberingSequences = async (req, res) => {
  try {
    const data = await systemAdminService.getNumberingSequences();
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getNumberingSequences error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateNumberingSequence = async (req, res) => {
  try {
    const { id } = req.params;
    const actorId = req.user?.id || null;
    const data = await systemAdminService.updateNumberingSequence(id, req.body, actorId);
    return res.json({ success: true, data, message: 'Numbering sequence updated successfully.' });
  } catch (err) {
    console.error('updateNumberingSequence error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 8. Currencies
const getCurrencies = async (req, res) => {
  try {
    const data = await systemAdminService.getCurrencies();
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getCurrencies error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const saveCurrency = async (req, res) => {
  try {
    const actorId = req.user?.id || null;
    const data = await systemAdminService.saveCurrency(req.body, actorId);
    return res.json({ success: true, data, message: 'Currency saved successfully.' });
  } catch (err) {
    console.error('saveCurrency error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 9. Units of Measure
const getUnits = async (req, res) => {
  try {
    const data = await systemAdminService.getUnits();
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getUnits error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const saveUnit = async (req, res) => {
  try {
    const actorId = req.user?.id || null;
    const data = await systemAdminService.saveUnit(req.body, actorId);
    return res.json({ success: true, data, message: 'Unit saved successfully.' });
  } catch (err) {
    console.error('saveUnit error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 10. Master Data Options
const getMasterDataOptions = async (req, res) => {
  try {
    const { category } = req.query;
    const data = await systemAdminService.getMasterDataOptions(category);
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getMasterDataOptions error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 11. Security Settings
const getSecuritySettings = async (req, res) => {
  try {
    const data = await systemAdminService.getSecuritySettings();
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getSecuritySettings error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 12. Audit Logs Viewer
const getAuditLogs = async (req, res) => {
  try {
    const { module, severity } = req.query;
    const data = await systemAdminService.getAuditLogs({ module, severity });
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getAuditLogs error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDashboardTelemetry,
  getOrganizationProfile,
  updateOrganizationProfile,
  getLocations,
  saveLocation,
  getDepartments,
  saveDepartment,
  getUsers,
  updateUserStatus,
  updateUserRole,
  getRoles,
  saveRole,
  getPermissions,
  getNumberingSequences,
  updateNumberingSequence,
  getCurrencies,
  saveCurrency,
  getUnits,
  saveUnit,
  getMasterDataOptions,
  getSecuritySettings,
  getAuditLogs
};
