import React, { useEffect, useState } from 'react';
import { TrendingUp, Target, Award, XCircle, Download } from 'lucide-react';
import { ReportsNavigationHeader } from '../../../components/reports/ReportsNavigationHeader';
import { GlobalReportFilterBar } from '../../../components/reports/GlobalReportFilterBar';
import { KPICard } from '../../../components/reports/KPICard';
import { GlobalReportFilters } from '../../../types/reports';
import { reportsService } from '../../../services/reports.service';

export const CRMReportPage: React.FC = () => {
  const [filters, setFilters] = useState<GlobalReportFilters>({ date_range: 'this_month' });
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await reportsService.getCRMReport(filters);
      setReportData(data);
    } catch (err) {
      console.error('Failed to load CRM report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const handleExport = () => {
    if (!reportData?.oppsTable) return;
    const headers = ['Opportunity', 'Value (₹)', 'Stage', 'Probability (%)'];
    const rows = reportData.oppsTable.map((o: any) => [
      o.title || o.name || 'Sales Deal',
      Number(o.expected_revenue || o.amount || 0).toFixed(2),
      o.stage || 'Pipeline',
      o.probability || 50
    ]);
    reportsService.exportToCSV('CRM_Sales_Pipeline_Report', headers, rows);
  };

  const metrics = reportData?.metrics;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-3">
            <TrendingUp className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span>CRM & Sales Pipeline Analytics</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Lead acquisition metrics, deal pipeline valuation, win rates, and stage conversion ratios.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export CRM CSV</span>
        </button>
      </div>

      <ReportsNavigationHeader />
      <GlobalReportFilterBar filters={filters} onChange={setFilters} onRefresh={fetchReport} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Total Pipeline Valuation"
          value={loading ? '...' : `₹${(metrics?.pipelineValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Forecasted deal revenue"
          icon={TrendingUp}
          color="emerald"
        />
        <KPICard
          title="Active Opportunities"
          value={loading ? '...' : metrics?.totalOpps || 0}
          subtitle="Deals in sales funnel"
          icon={Target}
          color="blue"
        />
        <KPICard
          title="Won Deals"
          value={loading ? '...' : metrics?.wonCount || 0}
          subtitle="Successfully closed contracts"
          icon={Award}
          color="purple"
        />
        <KPICard
          title="Lost Opportunities"
          value={loading ? '...' : metrics?.lostCount || 0}
          subtitle="Closed lost deals"
          icon={XCircle}
          color="rose"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Active CRM Opportunities & Pipeline</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Opportunity Name</th>
                <th className="px-6 py-4">Forecast Value</th>
                <th className="px-6 py-4">Stage</th>
                <th className="px-6 py-4">Probability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-10 text-slate-400">Loading sales pipeline...</td></tr>
              ) : !reportData?.oppsTable || reportData.oppsTable.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-slate-400">No CRM opportunities found.</td></tr>
              ) : (
                reportData.oppsTable.map((o: any) => (
                  <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{o.title || o.name || 'Sales Contract Opportunity'}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">₹{Number(o.expected_revenue || o.amount || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 capitalize">{o.stage || 'Qualification'}</td>
                    <td className="px-6 py-4 text-indigo-600 dark:text-indigo-400 font-semibold">{o.probability || 50}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
