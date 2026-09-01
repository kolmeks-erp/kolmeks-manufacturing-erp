import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ClipboardCheck,
  AlertTriangle,
  Lock,
  Plus,
  ArrowRight,
  TrendingUp,
  CheckSquare,
  Award,
  MessageSquare,
  BarChart2,
  AlertCircle
} from 'lucide-react';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { qualityService } from '../../../services/quality.service';
import { QualityKPIs, QualityInspection, NonConformanceReport } from '../../../types/quality';

const QualityDashboardPage: React.FC = () => {
  const [kpis, setKpis] = useState<QualityKPIs | null>(null);
  const [recentInspections, setRecentInspections] = useState<QualityInspection[]>([]);
  const [recentNCRs, setRecentNCRs] = useState<NonConformanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpiRes, inspRes, ncrRes] = await Promise.all([
        qualityService.getKPIs(),
        qualityService.getInspections({ limit: 5 }),
        qualityService.getNCRs()
      ]);

      if (kpiRes.success) setKpis(kpiRes.data);
      if (inspRes.success) setRecentInspections(inspRes.data);
      if (ncrRes.success) setRecentNCRs(ncrRes.data.slice(0, 5));
    } catch (err: any) {
      console.error('Failed to load quality dashboard:', err);
      setError(err.message || 'Unable to load quality dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingState message="Loading Quality QA & CAPA Dashboard..." />;
  if (error) return <ErrorState title="Error Loading Quality Data" message={error} onRetry={fetchDashboardData} />;

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Quality Assurance & CAPA Management"
        subtitle="Enterprise quality control, inspection plans, Non-Conformance Reports (NCR), CAPA tracking, and supplier quality."
        actions={
          <div className="flex items-center gap-3">
            <Link
              to="/secure-kolmeks-x0y0/quality/inspections/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Inspection
            </Link>
            <Link
              to="/secure-kolmeks-x0y0/quality/ncr/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Create NCR
            </Link>
            <Link
              to="/secure-kolmeks-x0y0/quality/capa/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-colors"
            >
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              New CAPA
            </Link>
          </div>
        }
      />

      {/* KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pass Rate %</p>
              <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{kpis?.passRate || 100}%</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Passed: <span className="font-semibold text-emerald-700">{kpis?.passedInspections || 0}</span> | Failed: <span className="font-semibold text-rose-600">{kpis?.failedInspections || 0}</span>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Inspections</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{kpis?.pendingInspections || 0}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            <span className="font-semibold text-slate-700">{kpis?.totalInspections || 0}</span> Total Inspections Logged
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Open NCRs</p>
              <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{kpis?.openNCRs || 0}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Overdue NCRs: <span className="font-bold text-rose-600">{kpis?.overdueNCRs || 0}</span>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active CAPAs</p>
              <h3 className="text-3xl font-extrabold text-indigo-600 mt-1">{kpis?.openCAPAs || 0}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Corrective & Preventive Action Plans</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quarantine Holds</p>
              <h3 className="text-3xl font-extrabold text-rose-600 mt-1">{kpis?.activeHolds || 0}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Materials isolated in quality quarantine</p>
        </div>
      </div>

      {/* QUICK MODULE ACCESS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link
          to="/secure-kolmeks-x0y0/quality/defects"
          className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center gap-3 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Defects Catalog</p>
            <p className="text-[10px] text-slate-500">Standard Codes</p>
          </div>
        </Link>

        <Link
          to="/secure-kolmeks-x0y0/quality/inspection-plans"
          className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center gap-3 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Inspection Plans</p>
            <p className="text-[10px] text-slate-500">Product Specs</p>
          </div>
        </Link>

        <Link
          to="/secure-kolmeks-x0y0/quality/quarantine"
          className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center gap-3 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Quarantine</p>
            <p className="text-[10px] text-slate-500">Hold & Scrap</p>
          </div>
        </Link>

        <Link
          to="/secure-kolmeks-x0y0/quality/suppliers"
          className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center gap-3 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Supplier Quality</p>
            <p className="text-[10px] text-slate-500">Vendor Scorecard</p>
          </div>
        </Link>

        <Link
          to="/secure-kolmeks-x0y0/quality/complaints"
          className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center gap-3 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
            <MessageSquare className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Complaints</p>
            <p className="text-[10px] text-slate-500">Customer RMAs</p>
          </div>
        </Link>

        <Link
          to="/secure-kolmeks-x0y0/quality/reports"
          className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center gap-3 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
            <BarChart2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Reports & Analytics</p>
            <p className="text-[10px] text-slate-500">Pareto & SPC</p>
          </div>
        </Link>
      </div>

      {/* RECENT INSPECTIONS TABLE & NCR TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inspections Column */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Recent Quality Inspections
            </h3>
            <Link
              to="/secure-kolmeks-x0y0/quality/inspections"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Inspection #</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Inspected / Accepted</th>
                  <th className="py-3 px-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentInspections.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                      No quality inspections recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentInspections.map((insp) => (
                    <tr key={insp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-indigo-600">
                        <Link to={`/secure-kolmeks-x0y0/quality/inspections/${insp.id}`}>
                          {insp.inspection_number}
                        </Link>
                      </td>
                      <td className="py-3 px-3 text-xs font-semibold text-slate-700">{insp.inspection_type}</td>
                      <td className="py-3 px-3 text-slate-900 font-medium">{insp.products?.name || 'N/A'}</td>
                      <td className="py-3 px-3 text-slate-700">
                        {insp.quantity_inspected} / <span className="text-emerald-600 font-semibold">{insp.quantity_accepted}</span>
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={insp.result || insp.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Non-Conformance Overview */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Active NCR Reports
            </h3>
            <Link
              to="/secure-kolmeks-x0y0/quality/ncr"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentNCRs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No active Non-Conformance Reports.</p>
            ) : (
              recentNCRs.map((ncr) => (
                <div key={ncr.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <Link to={`/secure-kolmeks-x0y0/quality/ncr/${ncr.id}`} className="text-xs font-bold text-indigo-600 hover:underline">
                      {ncr.ncr_number}
                    </Link>
                    <StatusBadge status={ncr.severity} />
                  </div>
                  <p className="text-xs font-medium text-slate-800 line-clamp-1">{ncr.title}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Status: <strong className="text-slate-700">{ncr.status}</strong></span>
                    <span>Due: {ncr.due_date || 'N/A'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityDashboardPage;
