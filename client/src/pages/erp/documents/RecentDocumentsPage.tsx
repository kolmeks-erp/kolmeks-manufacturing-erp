import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Eye } from 'lucide-react';
import { documentService } from '../../../services/document.service';
import { DocumentItem } from '../../../types/document';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const RecentDocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [recentDocs, setRecentDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    documentService
      .getRecentDocuments()
      .then((data) => setRecentDocs(data))
      .catch((err) => console.error('Failed to load recent documents:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Recent ERP Documents</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Recently uploaded, revised, or approved files in the ERP vault</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Doc #</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Type / Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading recent activity...
                  </td>
                </tr>
              ) : recentDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No recent document activity.
                  </td>
                </tr>
              ) : (
                recentDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{doc.document_number}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white max-w-xs truncate">{doc.title}</td>
                    <td className="px-6 py-4">
                      <div>{doc.type?.name || 'General'}</div>
                      <div className="text-xs text-slate-400">{doc.category?.name || 'Uncategorized'}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{doc.status}</td>
                    <td className="px-6 py-4">{new Date(doc.created_at).toLocaleDateString()}</td>
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
