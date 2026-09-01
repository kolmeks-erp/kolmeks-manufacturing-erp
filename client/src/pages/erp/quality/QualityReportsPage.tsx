import React, { useEffect, useState } from 'react';
import { BarChart2, TrendingUp, PieChart, RefreshCw, Layers } from 'lucide-react';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { qualityService } from '../../../services/quality.service';

const QualityReportsPage: React.FC = () => {
  const [paretoData, setParetoData] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const [paretoRes, sumRes] = await Promise.all([
        qualityService.getDefectsParetoReport(),
        qualityService.getQualityReportSummary()
      ]);

      if (paretoRes.success) setParetoData(paretoRes.data);
      if (sumRes.success) setSummaryData(sumRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load quality reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Quality Analytics & Pareto Reports"
        subtitle="Statistical process control, defect frequency analysis (Pareto 80/20), and monthly quality yield trends."
        actions={
          <button
            onClick={fetchReports}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Analytics
          </button>
        }
      />

      {loading ? (
        <LoadingState message="Generating Quality Reports & Pareto Chart..." />
      ) : error ? (
        <ErrorState title="Error Loading Reports" message={error} onRetry={fetchReports} />
      ) : (
        <div className="space-y-6">
          {/* PARETO DEFECT FREQUENCY ANALYSIS */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-600" />
                  Pareto Defect Analysis (80/20 Rule)
                </h3>
                <p className="text-xs text-slate-500">
                  Identifies vital defect categories accounting for the majority of non-conformances.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {paretoData.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-900">{item.category} ({item.count} defects)</span>
                    <span className="text-indigo-600 font-bold">{item.percentage}% (Cumul. {item.cumulativePercentage}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${item.percentage}%` }}
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MONTHLY YIELD TREND SUMMARY */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Monthly Quality Pass Yield Trend
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Month</th>
                    <th className="py-3 px-4 font-semibold">Total Inspections</th>
                    <th className="py-3 px-4 font-semibold">Passed Inspections</th>
                    <th className="py-3 px-4 font-semibold">Quality Yield %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summaryData?.monthlyTrend?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No inspection history recorded for trend analysis.
                      </td>
                    </tr>
                  ) : (
                    summaryData?.monthlyTrend?.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                          {row.month}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {row.total}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-600">
                          {row.passed}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-indigo-600">
                          {row.passRate}%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityReportsPage;
