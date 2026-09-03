import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  AlertTriangle,
  FileCheck,
  FolderKanban,
  CheckCircle2,
  Plus,
  ShieldCheck,
  FileSpreadsheet,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { documentService } from '../../../services/document.service';
import { DocumentTelemetry, DocumentItem } from '../../../types/document';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const DocumentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [telemetry, setTelemetry] = useState<DocumentTelemetry | null>(null);
  const [recentDocs, setRecentDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [tData, rData] = await Promise.all([
        documentService.getDashboardData(),
        documentService.getRecentDocuments(),
      ]);
      setTelemetry(tData);
      setRecentDocs(rData.slice(0, 6));
    } catch (err) {
      console.error('Failed to load document dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-slate-100 text-slate-700 border-slate-200/80',
      SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200/80',
      UNDER_REVIEW: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      PUBLISHED: 'bg-teal-50 text-teal-700 border-teal-200/80',
      REJECTED: 'bg-rose-50 text-rose-700 border-rose-200/80',
      CHANGES_REQUESTED: 'bg-amber-50 text-amber-800 border-amber-200/80',
      ARCHIVED: 'bg-slate-100 text-slate-600 border-slate-200/80',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles[status] || styles.DRAFT}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Document Management Telemetry</h1>
              <p className="text-xs text-slate-500 font-medium">
                Centralized ERP Document Vault, Version Control & Digital Approval Center
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/documents/library`)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Upload Document
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Vault</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {loading ? '...' : telemetry?.totalDocumentsCount || 0}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">All managed files</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Docs</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-600">
            {loading ? '...' : telemetry?.activeDocumentsCount || 0}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Controlled & live</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-purple-600">
            {loading ? '...' : telemetry?.pendingApprovalsCount || 0}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Awaiting sign-off</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Expiring Soon</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-600">
            {loading ? '...' : telemetry?.expiringSoonCount || 0}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Within 30 days</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Expired</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-600">
            {loading ? '...' : telemetry?.expiredCount || 0}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Requires renewal</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Review Due</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-indigo-600">
            {loading ? '...' : telemetry?.reviewDueCount || 0}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Periodic audit due</p>
        </div>
      </div>

      {/* Category Breakdown & Quick Navigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Category Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
          <h2 className="text-base font-bold text-slate-900 mb-3.5 flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-blue-600" />
            Documents by Category
          </h2>
          {loading ? (
            <div className="py-8 text-center text-slate-500 text-xs font-medium">Loading category breakdown...</div>
          ) : Object.keys(telemetry?.categoryBreakdown || {}).length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs font-medium">No category breakdown data available.</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(telemetry?.categoryBreakdown || {}).map(([catName, count]) => {
                const total = telemetry?.totalDocumentsCount || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={catName}>
                    <div className="flex justify-between text-xs mb-1 font-semibold">
                      <span className="text-slate-800">{catName}</span>
                      <span className="text-slate-500 font-medium">
                        {count} docs ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Hub Shortcuts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
          <h2 className="text-base font-bold text-slate-900 mb-1">Module Shortcuts</h2>

          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/documents/library`)}
            className="w-full p-3 rounded-xl border border-slate-200/80 hover:border-blue-500 hover:bg-slate-50/80 transition-all flex items-center justify-between text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs">Document Library</div>
                <div className="text-[11px] text-slate-500 font-medium">Browse & upload files</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/documents/approvals`)}
            className="w-full p-3 rounded-xl border border-slate-200/80 hover:border-purple-500 hover:bg-slate-50/80 transition-all flex items-center justify-between text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs">My Approvals</div>
                <div className="text-[11px] text-slate-500 font-medium">Review pending digital sign-offs</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/documents/expiring`)}
            className="w-full p-3 rounded-xl border border-slate-200/80 hover:border-amber-500 hover:bg-slate-50/80 transition-all flex items-center justify-between text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs">Expiring & Review Due</div>
                <div className="text-[11px] text-slate-500 font-medium">Track expirations & SOP reviews</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/documents/reports`)}
            className="w-full p-3 rounded-xl border border-slate-200/80 hover:border-emerald-500 hover:bg-slate-50/80 transition-all flex items-center justify-between text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs">Document Reports</div>
                <div className="text-[11px] text-slate-500 font-medium">Export audit logs & compliance data</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Recently Uploaded Documents
          </h2>
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/documents/recent`)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            View All Recent
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Doc #</th>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Type / Category</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Confidentiality</th>
                <th className="px-5 py-3">Created Date</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500 font-medium">
                    Loading recent documents...
                  </td>
                </tr>
              ) : recentDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500 font-medium">
                    No recent documents found in the ERP vault.
                  </td>
                </tr>
              ) : (
                recentDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-indigo-600">{doc.document_number}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 max-w-xs truncate">{doc.title}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800">{doc.type?.name || 'General'}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{doc.category?.name || 'Uncategorized'}</div>
                    </td>
                    <td className="px-5 py-3.5">{getStatusBadge(doc.status)}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {doc.confidentiality_level}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-600">{new Date(doc.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => navigate(`${ERP_BASE_PATH}/documents/${doc.id}`)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-lg transition-all cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
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
