import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface FinancialIntegrityAlertProps {
  isBalanced: boolean;
  difference?: number;
  type?: 'debit_credit' | 'balance_sheet';
  customTitle?: string;
}

export const FinancialIntegrityAlert: React.FC<FinancialIntegrityAlertProps> = ({
  isBalanced,
  difference = 0,
  type = 'debit_credit',
  customTitle,
}) => {
  if (isBalanced) {
    return (
      <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
        <ShieldCheck className="w-5 h-5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">
            {customTitle || (type === 'debit_credit' ? 'Double-Entry Accounting Integrity Verified' : 'Accounting Equation Integrity Verified')}
          </h4>
          <p className="text-xs text-emerald-400/80">
            {type === 'debit_credit'
              ? 'Total Debits strictly EQUAL Total Credits. Books are in full double-entry balance.'
              : 'Total Assets strictly EQUAL Total Liabilities + Equity (Assets = L + E).'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
      <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-pulse" />
      <div>
        <h4 className="font-semibold text-sm">
          {customTitle || 'FINANCIAL INTEGRITY ALERT — UNBALANCED BOOKS DETECTED'}
        </h4>
        <p className="text-xs text-rose-400/80">
          Discrepancy of <span className="font-mono font-bold">₹{difference.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span> detected!{' '}
          {type === 'debit_credit'
            ? 'Total Debits do NOT match Total Credits. Please review journal postings.'
            : 'Assets do NOT match Liabilities + Equity. Please verify control accounts.'}
        </p>
      </div>
    </div>
  );
};
