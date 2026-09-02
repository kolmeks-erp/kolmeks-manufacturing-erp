import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ShieldCheck, Eye } from 'lucide-react';
import { documentService } from '../../../services/document.service';
import { DocumentItem } from '../../../types/document';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const ExpiringDocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'expiringSoon' | 'expired' | 'reviewDue'>('expiringSoon');
  const [data, setData] = useState<{ expiringSoon: DocumentItem[]; expired: DocumentItem[]; reviewDue: DocumentItem[] }>({
    expiringSoon: [],
    expired: [],
    reviewDue: [],
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    documentService
      .getExpiringDocuments()
      .then((res) => setData(res))
      .catch((err) => console.error('Failed to load expiring documents:', err))
      .finally(() => setLoading(false));
  }, []);

  const activeList = data[tab] || [];

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Expiring & Review Due Documents</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Track upcoming certificate expirations, expired agreements, and mandatory SOP periodic review dates
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setTab('expiringSoon')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
            tab === 'expiringSoon'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          Expiring Soon ({data.expiringSoon.length})
        </button>

        <button
          onClick={() => setTab('expired')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
            tab === 'expired'
              ? 'bg-rose-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          Expired ({data.expired.length})
        </button>

        <button
          onClick={() => setTab('reviewDue')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
            tab === 'reviewDue'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          Review Due ({data.reviewDue.length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Doc #</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Target Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading compliance schedule...
                  </td>
                </tr>
              ) : activeList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No documents found in this section.
                  </td>
                </tr>
              ) : (
                activeList.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{doc.document_number}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white max-w-xs truncate">{doc.title}</td>
                    <td className="px-6 py-4">{doc.category?.name || 'Uncategorized'}</td>
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-rose-600 dark:text-rose-400">
                      {tab === 'reviewDue' ? doc.next_review_date || doc.review_date : doc.expiry_date}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{doc.status}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`${ERP_BASE_PATH}/documents/${doc.id}`)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
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
