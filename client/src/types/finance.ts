export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type NormalBalance = 'DEBIT' | 'CREDIT';
export type AccountStatus = 'ACTIVE' | 'INACTIVE';

export interface ChartOfAccount {
  id: string;
  account_code: string;
  account_name: string;
  account_type: AccountType;
  parent_account_id?: string | null;
  parent_account?: {
    id: string;
    account_code: string;
    account_name: string;
  } | null;
  category: string;
  description?: string | null;
  is_control_account: boolean;
  normal_balance: NormalBalance;
  status: AccountStatus;
  created_at: string;
  updated_at?: string;
  totalDebit?: number;
  totalCredit?: number;
  currentBalance?: number;
  recentActivity?: any[];
  children?: ChartOfAccount[];
}

export type PeriodStatus = 'OPEN' | 'CLOSED';

export interface FinancialPeriod {
  id: string;
  period_name: string;
  start_date: string;
  end_date: string;
  status: PeriodStatus;
  closed_at?: string | null;
  closed_by?: string | null;
  reopened_at?: string | null;
  reopened_by?: string | null;
  reopen_reason?: string | null;
  created_at: string;
}

export type JournalStatus = 'DRAFT' | 'POSTED' | 'VOIDED';

export interface JournalEntryLine {
  id?: string;
  journal_entry_id?: string;
  account_id: string;
  account?: ChartOfAccount;
  description?: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  journal_number: string;
  entry_date: string;
  financial_period_id: string;
  period?: FinancialPeriod;
  reference_type?: string;
  reference_id?: string;
  description: string;
  status: JournalStatus;
  total_debit: number;
  total_credit: number;
  posted_at?: string | null;
  voided_at?: string | null;
  void_reason?: string | null;
  reversed_journal_id?: string | null;
  lines?: JournalEntryLine[];
  created_at: string;
}

export interface GeneralLedgerItem {
  id: string;
  journal_entry_id: string;
  account_id: string;
  account?: ChartOfAccount;
  journal_entry?: JournalEntry;
  description?: string;
  debit: number;
  credit: number;
  running_balance: number;
  created_at: string;
}

export interface TrialBalanceItem {
  id: string;
  account_code: string;
  account_name: string;
  account_type: AccountType;
  normal_balance: NormalBalance;
  total_debit: number;
  total_credit: number;
  net_balance: number;
}

export interface TrialBalanceData {
  items: TrialBalanceItem[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  difference: number;
}

export interface ProfitLossItem {
  id: string;
  account_code: string;
  account_name: string;
  amount: number;
}

export interface ProfitLossData {
  revenueItems: ProfitLossItem[];
  expenseItems: ProfitLossItem[];
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

export interface BalanceSheetItem {
  id: string;
  account_code: string;
  account_name: string;
  category: string;
  balance: number;
}

export interface BalanceSheetData {
  assets: BalanceSheetItem[];
  liabilities: BalanceSheetItem[];
  equity: BalanceSheetItem[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
  difference: number;
}

export interface FinanceDashboardKPIs {
  totalRevenue: number;
  totalExpenses: number;
  netProfitLoss: number;
  cashBankBalance: number;
  accountsReceivable: number;
  accountsPayable: number;
  postedJournalsCount: number;
  activePeriod?: {
    id: string;
    period_name: string;
    status: PeriodStatus;
  } | null;
  recentPostedJournals: JournalEntry[];
}
