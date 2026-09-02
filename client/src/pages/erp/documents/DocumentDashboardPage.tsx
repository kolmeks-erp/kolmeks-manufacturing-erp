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
      DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      SUBMITTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      UNDER_REVIEW: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
      APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
      PUBLISHED: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
      REJECTED: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
      CHANGES_REQUESTED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      ARCHIVED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || styles.DRAFT}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Document Management Telemetry</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Centralized ERP Document Vault, Version Control & Digital Approval Center
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/documents/library`)}
            className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Vault</span>
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {loading ? '...' : telemetry?.totalDocumentsCount || 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">All managed files</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Documents</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {loading ? '...' : telemetry?.activeDocumentsCount || 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">Controlled & live</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Approvals</span>
            <Clock className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {loading ? '...' : telemetry?.pendingApprovalsCount || 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">Awaiting digital sign-off</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Expiring Soon</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {loading ? '...' : telemetry?.expiringSoonCount || 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">Within 30 days</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Expired Documents</span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {loading ? '...' : telemetry?.expiredCount || 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">Requires renewal</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Review Due</span>
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {loading ? '...' : telemetry?.reviewDueCount || 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">Periodic audit due</p>
        </div>
      </div>

      {/* Category Breakdown & Quick Navigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-blue-500" />
            Documents by Category
          </h2>
          {loading ? (
            <div className="py-12 text-center text-slate-500">Loading category breakdown...</div>
          ) : Object.keys(telemetry?.categoryBreakdown || {}).length === 0 ? (
            <div className="py-12 text-center text-slate-500">No category breakdown data available.</div>
          ) : (
            <div className="space-y-4">
              {Object.entries(telemetry?.categoryBreakdown || {}).map(([catName, count]) => {
                const total = telemetry?.totalDocumentsCount || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={catName}>
                    <div className="flex justify-between text-sm mb-1 font-medium">
                      <span className="text-slate-700 dark:text-slate-300">{catName}</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {count} docs ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Hub Shortcuts */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Module Shortcuts</h2>

          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/documents/library`)}
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              <FileCheck className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white text-sm">Document Library</div>
                <div className="text-xs text-slate-500">Browse & upload files</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/documents/approvals`)}
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-purple-500" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white text-sm">My Approvals</div>
                <div className="text-xs text-slate-500">Review pending digital sign-offs</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/documents/expiring`)}
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white text-sm">Expiring & Review Due</div>
                <div className="text-xs text-slate-500">Track expirations & SOP reviews</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/documents/reports`)}
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white text-sm">Document Reports</div>
                <div className="text-xs text-slate-500">Export audit logs & compliance data</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Recently Uploaded Documents
          </h2>
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/documents/recent`)}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            View All Recent
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Doc #</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Type / Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Confidentiality</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Loading recent documents...
                  </td>
                </tr>
              ) : recentDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No recent documents found in the ERP vault.
                  </td>
                </tr>
              ) : (
                recentDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{doc.document_number}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white max-w-xs truncate">{doc.title}</td>
                    <td className="px-6 py-4">
                      <div>{doc.type?.name || 'General'}</div>
                      <div className="text-xs text-slate-400">{doc.category?.name || 'Uncategorized'}</div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(doc.status)}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {doc.confidentiality_level}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(doc.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`${ERP_BASE_PATH}/documents/${doc.id}`)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
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
