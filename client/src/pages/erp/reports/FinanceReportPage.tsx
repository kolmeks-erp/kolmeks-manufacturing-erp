import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Receipt, Download } from 'lucide-react';
import { ReportsNavigationHeader } from '../../../components/reports/ReportsNavigationHeader';
import { GlobalReportFilterBar } from '../../../components/reports/GlobalReportFilterBar';
import { KPICard } from '../../../components/reports/KPICard';
import { GlobalReportFilters } from '../../../types/reports';
import { reportsService } from '../../../services/reports.service';

export const FinanceReportPage: React.FC = () => {
  const [filters, setFilters] = useState<GlobalReportFilters>({ date_range: 'this_month' });
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await reportsService.getFinanceReport(filters);
      setReportData(data);
    } catch (err) {
      console.error('Failed to load finance report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const handleExport = () => {
    if (!reportData?.metrics) return;
    const m = reportData.metrics;
    const headers = ['Financial Indicator', 'Amount (€)'];
    const rows = [
      ['Total Accounts Receivable', m.receivables.toFixed(2)],
      ['Total Accounts Payable', m.payables.toFixed(2)],
      ['Total Operational Expenses', m.expenses.toFixed(2)],
      ['Outstanding Customer Invoices', m.outstandingCustomerInvoices],
      ['Outstanding Supplier Bills', m.outstandingSupplierBills]
    ];
    reportsService.exportToCSV('Financial_Executive_Report', headers, rows);
  };

  const metrics = reportData?.metrics;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <DollarSign className="w-7 h-7 text-emerald-400" />
            <span>Financial Accounting & Cash Flow Analytics</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Accounts receivable aging, supplier payables, operating expense tracking, and invoice statuses.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Finance CSV</span>
        </button>
      </div>

      <ReportsNavigationHeader />
      <GlobalReportFilterBar filters={filters} onChange={setFilters} onRefresh={fetchReport} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Accounts Receivable (AR)"
          value={loading ? '...' : `€${(metrics?.receivables || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Billed customer invoices"
          icon={TrendingUp}
          color="emerald"
        />
        <KPICard
          title="Accounts Payable (AP)"
          value={loading ? '...' : `€${(metrics?.payables || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Outstanding vendor bills"
          icon={TrendingDown}
          color="rose"
        />
        <KPICard
          title="Operating Expenses"
          value={loading ? '...' : `€${(metrics?.expenses || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Operational expense claims"
          icon={Receipt}
          color="amber"
        />
        <KPICard
          title="Unpaid AR Invoices"
          value={loading ? '...' : metrics?.outstandingCustomerInvoices || 0}
          subtitle="Invoices pending settlement"
          icon={DollarSign}
          color="purple"
        />
      </div>
    </div>
  );
};
