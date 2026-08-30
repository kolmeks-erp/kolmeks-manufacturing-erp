import api from './api';
import {
  FinanceDashboardKPIs,
  ChartOfAccount,
  FinancialPeriod,
  JournalEntry,
  GeneralLedgerItem,
  TrialBalanceData,
  ProfitLossData,
  BalanceSheetData,
} from '../types/finance';

export const financeService = {
  // 1. Dashboard
  getDashboardKPIs: async (): Promise<FinanceDashboardKPIs> => {
    const res = await api.get('/finance/dashboard');
    return res.data.data;
  },

  // 2. Chart of Accounts
  getAccounts: async (params?: { type?: string; category?: string; status?: string; search?: string }): Promise<ChartOfAccount[]> => {
    const res = await api.get('/finance/accounts', { params });
    return res.data.data;
  },

  getAccountById: async (id: string): Promise<ChartOfAccount> => {
    const res = await api.get(`/finance/accounts/${id}`);
    return res.data.data;
  },

  createAccount: async (data: Partial<ChartOfAccount>): Promise<ChartOfAccount> => {
    const res = await api.post('/finance/accounts', data);
    return res.data.data;
  },

  updateAccount: async (id: string, data: Partial<ChartOfAccount>): Promise<ChartOfAccount> => {
    const res = await api.patch(`/finance/accounts/${id}`, data);
    return res.data.data;
  },

  // 3. Financial Periods
  getPeriods: async (): Promise<FinancialPeriod[]> => {
    const res = await api.get('/finance/periods');
    return res.data.data;
  },
  getFinancialPeriods: async (): Promise<FinancialPeriod[]> => {
    const res = await api.get('/finance/periods');
    return res.data.data;
  },

  createPeriod: async (data: { period_name: string; start_date: string; end_date: string }): Promise<FinancialPeriod> => {
    const res = await api.post('/finance/periods', data);
    return res.data.data;
  },

  closePeriod: async (id: string): Promise<FinancialPeriod> => {
    const res = await api.post(`/finance/periods/${id}/close`, {});
    return res.data.data;
  },

  reopenPeriod: async (id: string, reopen_reason: string): Promise<FinancialPeriod> => {
    const res = await api.post(`/finance/periods/${id}/reopen`, { reopen_reason });
    return res.data.data;
  },

  // 4. Journal Entries
  getJournalEntries: async (params?: { status?: string; start_date?: string; end_date?: string; search?: string }): Promise<JournalEntry[]> => {
    const res = await api.get('/finance/journal-entries', { params });
    return res.data.data;
  },

  getJournalEntryById: async (id: string): Promise<JournalEntry> => {
    const res = await api.get(`/finance/journal-entries/${id}`);
    return res.data.data;
  },

  createJournalEntry: async (data: {
    entry_date: string;
    description: string;
    reference_type?: string;
    reference_id?: string;
    lines: { account_id: string; description?: string; debit: number; credit: number }[];
  }): Promise<JournalEntry> => {
    const res = await api.post('/finance/journal-entries', data);
    return res.data.data;
  },

  postJournalEntry: async (id: string): Promise<JournalEntry> => {
    const res = await api.post(`/finance/journal-entries/${id}/post`, {});
    return res.data.data;
  },

  reverseJournalEntry: async (id: string, void_reason: string): Promise<JournalEntry> => {
    const res = await api.post(`/finance/journal-entries/${id}/reverse`, { void_reason });
    return res.data.data;
  },

  // 5. Reporting
  getGeneralLedger: async (params?: { account_id?: string; start_date?: string; end_date?: string; search?: string }): Promise<GeneralLedgerItem[]> => {
    const res = await api.get('/finance/general-ledger', { params });
    return res.data.data;
  },

  getTrialBalance: async (params?: { start_date?: string; end_date?: string }): Promise<TrialBalanceData> => {
    const res = await api.get('/finance/trial-balance', { params });
    return res.data.data;
  },

  getProfitLoss: async (params?: { start_date?: string; end_date?: string }): Promise<ProfitLossData> => {
    const res = await api.get('/finance/profit-loss', { params });
    return res.data.data;
  },

  getBalanceSheet: async (): Promise<BalanceSheetData> => {
    const res = await api.get('/finance/balance-sheet');
    return res.data.data;
  },
};
