const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');
const financeController = require('../controllers/finance.controller');

// Enforce authentication across all Finance endpoints
router.use(authenticateUser);

// Allow Finance users, Accountants, Managers, and Admins
const financeAuth = authorizeRoles('admin', 'finance', 'accountant', 'manager');

// 1. Dashboard
router.get('/dashboard', financeAuth, financeController.getFinanceDashboardKPIs);

// 2. Chart of Accounts
router.get('/accounts', financeAuth, financeController.getAccounts);
router.get('/accounts/:id', financeAuth, financeController.getAccountById);
router.post('/accounts', financeAuth, financeController.createAccount);
router.patch('/accounts/:id', financeAuth, financeController.updateAccount);

// 3. Financial Periods
router.get('/periods', financeAuth, financeController.getPeriods);
router.post('/periods', financeAuth, financeController.createPeriod);
router.post('/periods/:id/close', financeAuth, financeController.closePeriod);
router.post('/periods/:id/reopen', financeAuth, financeController.reopenPeriod);

// 4. Journal Entries & Double-Entry Workflow
router.get('/journal-entries', financeAuth, financeController.getJournalEntries);
router.get('/journal-entries/:id', financeAuth, financeController.getJournalEntryById);
router.post('/journal-entries', financeAuth, financeController.createJournalEntry);
router.post('/journal-entries/:id/post', financeAuth, financeController.postJournalEntry);
router.post('/journal-entries/:id/reverse', financeAuth, financeController.reverseJournalEntry);

// 5. General Ledger & Financial Statements
router.get('/general-ledger', financeAuth, financeController.getGeneralLedger);
router.get('/trial-balance', financeAuth, financeController.getTrialBalance);
router.get('/profit-loss', financeAuth, financeController.getProfitLoss);
router.get('/balance-sheet', financeAuth, financeController.getBalanceSheet);

module.exports = router;
