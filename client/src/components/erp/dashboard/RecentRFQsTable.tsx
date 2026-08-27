import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, Eye } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { EmptyState } from '../EmptyState';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export interface RFQRecord {
  id: string;
  rfq_number: string;
  company: string;
  full_name: string;
  email: string;
  requirement_type: string;
  component_name?: string;
  quantity?: number;
  unit?: string;
  status: string;
  created_at: string;
}

interface RecentRFQsTableProps {
  rfqs: RFQRecord[];
  isLoading?: boolean;
}

export const RecentRFQsTable: React.FC<RecentRFQsTableProps> = ({ rfqs, isLoading }) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-[#0B1E36] text-base">Recent Request for Quotations (RFQs)</h3>
        </div>
        <Link
          to={`${ERP_BASE_PATH}/rfqs`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span>View All RFQs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="p-6 space-y-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-lg w-full" />
          ))}
        </div>
      ) : rfqs.length === 0 ? (
        /* Empty State */
        <EmptyState
          title="No RFQ requests yet."
          description="Once customers submit quotation requests via the public portal (/request-quote), they will safely appear here for engineering evaluation."
          icon={<FileText className="w-8 h-8 text-slate-400" />}
        />
      ) : (
        /* Data Table */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">Request Ref</th>
                <th className="py-3 px-5">Company / Customer</th>
                <th className="py-3 px-5">Capability Type</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Submitted Date</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-slate-800">
              {rfqs.map((rfq) => (
                <tr key={rfq.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-5 font-mono font-bold text-blue-900">
                    {rfq.rfq_number || 'RFQ-PENDING'}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-slate-900">{rfq.company}</div>
                    <div className="text-[11px] text-slate-500">{rfq.full_name}</div>
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-slate-700">
                    {rfq.requirement_type}
                  </td>
                  <td className="py-3.5 px-5">
                    <StatusBadge status={rfq.status} />
                  </td>
                  <td className="py-3.5 px-5 text-slate-500 font-mono">
                    {formatDate(rfq.created_at)}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <Link
                      to={`${ERP_BASE_PATH}/rfqs`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
