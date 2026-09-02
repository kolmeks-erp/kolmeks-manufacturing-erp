import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  FileCheck,
} from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { salesService } from '../../../services/sales.service';
import { AdvancedQuotation } from '../../../types/sales';

export const AdvancedQuotationListPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quotations, setQuotations] = useState<AdvancedQuotation[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await salesService.getQuotations({
        page,
        limit: 10,
        search,
        status: statusFilter,
      });
      setQuotations(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      console.error('Failed to load quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchQuotations();
  };

  const getStatusBadge = (status: string) => {
    const norm = (status || '').toUpperCase();
    switch (norm) {
      case 'ACCEPTED':
      case 'APPROVED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1 w-fit">
            <CheckCircle className="w-3 h-3" />
            <span>{norm}</span>
          </span>
        );
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
      case 'SENT':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center space-x-1 w-fit">
            <Clock className="w-3 h-3" />
            <span>{norm}</span>
          </span>
        );
      case 'REJECTED':
      case 'EXPIRED':
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center space-x-1 w-fit">
            <XCircle className="w-3 h-3" />
            <span>{norm}</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/80 text-slate-300 border border-slate-600 flex items-center space-x-1 w-fit">
            <Clock className="w-3 h-3" />
            <span>DRAFT</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <FileSpreadsheet className="w-7 h-7 text-blue-400" />
            <span>Commercial Quotations</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage customer proposals, calculate standard & custom discounts, validities, and convert directly into Sales Orders.
          </p>
        </div>
        <Link
          to={`${ERP_BASE_PATH}/sales/quotations/new`}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Quotation</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full md:w-96">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search Quotation number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 text-white text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button type="submit" className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-xl transition">
            Search
          </button>
        </form>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900/80 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="SENT">Sent</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">Quotation No.</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Valid Until</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Loading commercial quotations...
                  </td>
                </tr>
              ) : quotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No quotations found matching parameters.
                  </td>
                </tr>
              ) : (
                quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4 font-semibold text-white">
                      <Link to={`${ERP_BASE_PATH}/sales/quotations/${q.id}`} className="hover:text-blue-400 transition">
                        {q.quotation_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {q.customer_master?.company_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{q.quotation_date || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-400">{q.valid_until || 'N/A'}</td>
                    <td className="px-6 py-4 font-bold text-white">
                      {q.currency} {Number(q.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(q.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`${ERP_BASE_PATH}/sales/quotations/${q.id}`}
                          className="p-2 bg-slate-700/60 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
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
