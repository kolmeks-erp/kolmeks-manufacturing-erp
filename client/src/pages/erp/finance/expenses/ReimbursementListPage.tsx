import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Search,
  RefreshCw,
  Eye,
  BookOpen,
  XCircle,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { ERPLayout } from '../../../../layouts/ERPLayout';
import { ERPPageHeader } from '../../../../components/erp/ERPPageHeader';
import { LoadingState } from '../../../../components/erp/LoadingState';
import { ErrorState } from '../../../../components/erp/ErrorState';
import { expenseService, Reimbursement } from '../../../../services/expense.service';
import { ERP_BASE_PATH } from '../../../../constants/navigation';

export const ReimbursementListPage: React.FC = () => {
  const navigate = useNavigate();
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Void modal state
  const [voidingId, setVoidingId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState<string>('');
  const [voidSubmitting, setVoidSubmitting] = useState<boolean>(false);

  const fetchReimbursements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await expenseService.getReimbursements({ search: searchQuery });
      setReimbursements(data);
    } catch (err: any) {
      console.error('Failed to load reimbursements:', err);
      setError(err?.response?.data?.message || 'Failed to fetch reimbursement records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReimbursements();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReimbursements();
  };

  const handleVoidReimbursement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidingId || !voidReason.trim()) return;
    try {
      setVoidSubmitting(true);
      await expenseService.voidReimbursement(voidingId, voidReason.trim());
      setVoidingId(null);
      setVoidReason('');
      await fetchReimbursements();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to void reimbursement.');
    } finally {
      setVoidSubmitting(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Reimbursement Settlement Register
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Track cash and bank payments remitted to employees against approved claims, reference numbers, and linked journal entries.
            </p>
          </div>
        </div>
        <button
          onClick={fetchReimbursements}
          className="inline-flex items-center justify-center px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-2" />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by remittance number, employee, UTR ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 pl-10 pr-4 py-2 rounded-lg text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition"
          />
        </form>
        <span className="text-xs font-semibold text-slate-500">Total {reimbursements.length} reimbursement vouchers</span>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingState message="Loading reimbursement vouchers..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchReimbursements} />
      ) : reimbursements.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-xl p-12 text-center text-slate-500 shadow-xs">
          <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No Reimbursements Found</h3>
          <p className="text-xs text-slate-500">No payment settlements matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-700 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">Voucher #</th>
                  <th className="py-3.5 px-4">Claim #</th>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Payment Date</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Reference / UTR</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reimbursements.map((reimb) => (
                  <tr key={reimb.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-purple-600 font-bold">{reimb.reimbursement_number}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-600 font-bold">
                      {reimb.claim ? (
                        <button
                          onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/claims/${reimb.claim_id}`)}
                          className="hover:underline flex items-center cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1" />
                          {reimb.claim.claim_number}
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {reimb.employee ? `${reimb.employee.first_name} ${reimb.employee.last_name}` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{reimb.reimbursement_date}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-semibold">{reimb.payment_method.replace('_', ' ')}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-xs">{reimb.reference_number || '-'}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(reimb.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {reimb.status === 'POSTED' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          POSTED
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          VOIDED
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {reimb.status === 'POSTED' && (
                        <button
                          onClick={() => setVoidingId(reimb.id)}
                          className="inline-flex items-center text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg transition font-semibold cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Void
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Void Modal */}
      {voidingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleVoidReimbursement} className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <XCircle className="w-5 h-5 mr-2 text-rose-600" /> Void Reimbursement Voucher
            </h3>
            <p className="text-xs text-slate-500">
              Voiding will reverse the journal entry and reopen the outstanding balance on the expense claim.
            </p>
            <textarea
              rows={3}
              required
              placeholder="Reason for voiding..."
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 rounded-lg text-xs focus:outline-none focus:border-rose-500 focus:bg-white transition"
            />
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setVoidingId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={voidSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
              >
                {voidSubmitting ? 'Voiding...' : 'Confirm Void'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ReimbursementListPage;
