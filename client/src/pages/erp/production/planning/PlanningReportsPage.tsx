import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart2,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Calendar,
} from 'lucide-react';
import { ERPLayout } from '../../../../layouts/ERPLayout';
import ERPPageHeader from '../../../../components/erp/ERPPageHeader';
import StatusBadge from '../../../../components/erp/StatusBadge';
import LoadingState from '../../../../components/erp/LoadingState';
import ErrorState from '../../../../components/erp/ErrorState';
import EmptyState from '../../../../components/erp/EmptyState';
import { planningService } from '../../../../services/planning.service';

const PlanningReportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan_id') || undefined;

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any[]>([]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await planningService.getReports({ plan_id: planId });
      if (res.success) {
        setReportData(res.data || []);
      } else {
        setError(res.message || 'Failed to load planning reports.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error generating plan vs actual report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [planId]);

  return (
    <ERPLayout>
      <div className="space-y-6">
        <ERPPageHeader
          title="Plan vs Actual Production Analytics"
          subtitle="Compare planned production quantities against actual completed quantities, shop floor execution, and variance percentages"
          actions={
            <button
              onClick={fetchReports}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <RefreshCw size={14} /> Refresh Report
            </button>
          }
        />

        {/* Report Table */}
        {loading ? (
          <LoadingState message="Generating Plan vs Actual Production Analytics..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchReports} />
        ) : reportData.length === 0 ? (
          <EmptyState
            title="No Planning Report Data Available"
            description="Ensure that production plans have been created and approved to compare against shop floor execution."
          />
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <FileSpreadsheet className="text-purple-400" size={16} /> Plan vs Actual Execution Summary ({reportData.length} lines)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Plan No.</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3 text-right">Planned Qty</th>
                    <th className="px-4 py-3 text-right">Scheduled Qty</th>
                    <th className="px-4 py-3 text-right">Completed Qty</th>
                    <th className="px-4 py-3 text-right">Remaining Qty</th>
                    <th className="px-4 py-3 text-center">Completion %</th>
                    <th className="px-4 py-3">Required Date</th>
                    <th className="px-4 py-3">Production Order</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {reportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-mono font-semibold text-blue-400">{row.plan_number}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-100">{row.product_name}</div>
                        <div className="font-mono text-slate-400">{row.product_code}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-200">
                        {row.planned_quantity} {row.unit}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-300">{row.scheduled_quantity}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">{row.completed_quantity}</td>
                      <td className="px-4 py-3 text-right font-mono text-amber-400">{row.remaining_quantity}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-mono font-bold">{row.completion_pct}%</span>
                          <div className="w-16 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 hidden md:block">
                            <div
                              className="h-full bg-emerald-400 rounded-full"
                              style={{ width: `${Math.min(100, row.completion_pct)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">{row.required_date}</td>
                      <td className="px-4 py-3 font-mono text-indigo-400">
                        {row.production_order_number || 'Unassigned'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ERPLayout>
  );
};

export default PlanningReportsPage;
