import React, { useEffect, useState } from 'react';
import { Award, RefreshCw, TrendingUp, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { qualityService } from '../../../services/quality.service';
import { SupplierQualityMetric } from '../../../types/quality';

const SupplierQualityPage: React.FC = () => {
  const [metrics, setMetrics] = useState<SupplierQualityMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSupplierQuality = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await qualityService.getSupplierPerformance();
      if (res.success) {
        setMetrics(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch supplier quality scorecard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplierQuality();
  }, []);

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Supplier Quality Scorecard & PPM"
        subtitle="Track incoming material pass rates, PPM defect metrics, supplier NCR counts, and vendor quality ratings."
      />

      {loading ? (
        <LoadingState message="Calculating Supplier Quality Scorecards..." />
      ) : error ? (
        <ErrorState title="Error Loading Supplier Quality" message={error} onRetry={fetchSupplierQuality} />
      ) : (
        <div className="space-y-6">
          {/* SUMMARY GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">Active Vendors Tracked</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{metrics.length}</h3>
              <p className="text-xs text-slate-500 mt-2">Evaluated on incoming inspections</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">Average Vendor Pass Rate</p>
              <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">
                {(metrics.reduce((acc, cur) => acc + cur.passRate, 0) / (metrics.length || 1)).toFixed(1)}%
              </h3>
              <p className="text-xs text-slate-500 mt-2">Overall receiving inspection standard</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">Average Defect PPM</p>
              <h3 className="text-3xl font-extrabold text-indigo-600 mt-1">
                {Math.round(metrics.reduce((acc, cur) => acc + cur.ppm, 0) / (metrics.length || 1))} PPM
              </h3>
              <p className="text-xs text-slate-500 mt-2">Parts per million defect rate</p>
            </div>
          </div>

          {/* SUPPLIER SCORECARD TABLE */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                Supplier Performance Ratings
              </h3>
              <button
                onClick={fetchSupplierQuality}
                className="p-2 text-slate-500 hover:text-slate-700 bg-slate-50 rounded-lg border border-slate-200"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Vendor Code</th>
                  <th className="py-3.5 px-4 font-semibold">Company Name</th>
                  <th className="py-3.5 px-4 font-semibold">Inspections (Pass / Fail)</th>
                  <th className="py-3.5 px-4 font-semibold">Pass Rate</th>
                  <th className="py-3.5 px-4 font-semibold">Defect PPM</th>
                  <th className="py-3.5 px-4 font-semibold">Supplier NCRs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No supplier quality metrics recorded yet.
                    </td>
                  </tr>
                ) : (
                  metrics.map((sup) => (
                    <tr key={sup.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-indigo-600 font-mono">
                        {sup.supplier_code || 'VEN-001'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {sup.company_name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900">{sup.totalInspections}</span> (
                        <span className="text-emerald-600 font-semibold">{sup.passedInspections}</span> /{' '}
                        <span className="text-rose-600 font-semibold">{sup.failedInspections}</span>)
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-600">
                        {sup.passRate}%
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                        {sup.ppm} PPM
                      </td>
                      <td className="py-3.5 px-4 font-semibold">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-md ${sup.ncrCount > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600'}`}>
                          {sup.ncrCount} NCRs
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierQualityPage;
