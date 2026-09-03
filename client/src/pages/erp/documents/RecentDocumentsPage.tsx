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
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-xs">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Recent ERP Documents</h1>
            <p className="text-xs text-slate-500 font-medium">Recently uploaded, revised, or approved files in the ERP vault</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Doc #</th>
                <th className="px-5 py-3.5">Title</th>
                <th className="px-5 py-3.5">Type / Category</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Created Date</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500 font-medium">
                    Loading recent activity...
                  </td>
                </tr>
              ) : recentDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500 font-medium">
                    No recent document activity.
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
                    <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-slate-700">{doc.status}</td>
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
