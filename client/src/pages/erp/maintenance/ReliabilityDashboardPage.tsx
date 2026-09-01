import React, { useState, useEffect } from 'react';
import { 
  Activity, Clock, ShieldAlert, Cpu, CheckCircle2, TrendingUp, AlertTriangle, 
  BarChart3, RefreshCw, AlertCircle
} from 'lucide-react';
import { ERPLayout } from '../../../layouts/ERPLayout';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import { maintenanceService } from '../../../services/maintenance.service';
import { ReliabilityAnalytics } from '../../../types/maintenance';

const ReliabilityDashboardPage: React.FC = () => {
  const [data, setData] = useState<ReliabilityAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await maintenanceService.getReliabilityAnalytics();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load reliability analytics:', err);
      setError(err.message || 'Unable to calculate asset reliability metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <ERPLayout><LoadingState message="Calculating MTBF, MTTR & Asset Reliability telemetry..." /></ERPLayout>;
  if (error) return <ERPLayout><ErrorState message={error} onRetry={fetchAnalytics} /></ERPLayout>;

  return (
    <ERPLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <ERPPageHeader
          title="Asset Reliability & Telemetry Analytics"
          subtitle="Real-time MTBF, MTTR, Availability calculations, and recurring failure pattern identification."
          icon={Activity}
          actions={
            <button
              onClick={fetchAnalytics}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Recalculate Metrics
            </button>
          }
        />

        {/* Top Reliability Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">MTBF (Hours)</span>
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono">
              {data?.mtbfHours !== null ? `${data?.mtbfHours} hrs` : 'N/A'}
            </div>
            <p className="text-xs text-slate-500">Mean Time Between Failures</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">MTTR (Hours)</span>
              <Activity className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono">
              {data?.mttrHours !== null ? `${data?.mttrHours} hrs` : 'N/A'}
            </div>
            <p className="text-xs text-slate-500">Mean Time To Repair</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Asset Availability</span>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-700 font-mono">
              {data?.availabilityPercentage !== undefined ? `${data.availabilityPercentage}%` : 'N/A'}
            </div>
            <p className="text-xs text-slate-500">Operating / Planned Hours</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Failures</span>
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl font-extrabold text-red-600 font-mono">
              {data?.totalBreakdownsCount || 0}
            </div>
            <p className="text-xs text-slate-500">Recorded Breakdowns</p>
          </div>
        </div>

        {/* Detailed Breakdown Tables & Threshold Warning */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Operating Telemetry Summary */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" /> Plant Operational Telemetry
            </h3>

            <div className="space-y-3 divide-y divide-slate-100 text-sm">
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Total Registered Plant Assets</span>
                <span className="font-semibold text-slate-900 font-mono">{data?.totalAssetsCount}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Actual Operating Hours</span>
                <span className="font-semibold text-slate-900 font-mono">{data?.actualOperatingHours} hrs</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Total Downtime Cumulative</span>
                <span className="font-semibold text-red-600 font-mono">{data?.totalDowntimeHours} hrs</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Completed Work Order Repairs</span>
                <span className="font-semibold text-emerald-700 font-mono">{data?.totalRepairsCount}</span>
              </div>
            </div>
          </div>

          {/* Repeated Failure Machinery List */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" /> High-Risk Assets (Repeated Failures)
            </h3>

            {!data?.repeatedFailureAssets || data.repeatedFailureAssets.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-100">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">No Chronic Equipment Failures Detected</p>
                <p className="text-xs text-slate-500 mt-1">All plant machinery operating within normal reliability thresholds.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.repeatedFailureAssets.map(asset => (
                  <div key={asset.id} className="p-3 border border-amber-200 bg-amber-50/50 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{asset.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{asset.asset_code} | {asset.location || 'Plant Floor'}</div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-800 border border-red-200">
                        {asset.failure_count} Breakdowns
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ERPLayout>
  );
};

export default ReliabilityDashboardPage;
