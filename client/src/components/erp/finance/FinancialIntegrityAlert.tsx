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
      <div className="flex items-center gap-3 p-4 bg-emerald-50/90 border border-emerald-200 rounded-xl text-emerald-900 shadow-xs">
        <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-600" />
        <div>
          <h4 className="font-bold text-sm text-emerald-900">
            {customTitle || (type === 'debit_credit' ? 'Double-Entry Accounting Integrity Verified' : 'Accounting Equation Integrity Verified')}
          </h4>
          <p className="text-xs text-emerald-700 font-medium">
            {type === 'debit_credit'
              ? 'Total Debits strictly EQUAL Total Credits. Books are in full double-entry balance.'
              : 'Total Assets strictly EQUAL Total Liabilities + Equity (Assets = L + E).'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-rose-50/90 border border-rose-200 rounded-xl text-rose-900 shadow-xs">
      <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600 animate-pulse" />
      <div>
        <h4 className="font-bold text-sm text-rose-900">
          {customTitle || 'FINANCIAL INTEGRITY ALERT — UNBALANCED BOOKS DETECTED'}
        </h4>
        <p className="text-xs text-rose-700 font-medium">
          Discrepancy of <span className="font-mono font-bold text-rose-950">₹{difference.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span> detected!{' '}
          {type === 'debit_credit'
            ? 'Total Debits do NOT match Total Credits. Please review journal postings.'
            : 'Assets do NOT match Liabilities + Equity. Please verify control accounts.'}
        </p>
      </div>
    </div>
  );
};
