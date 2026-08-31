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
    <ERPLayout activeTab="finance">
      <div className="space-y-6">
        <ERPPageHeader
          title="Reimbursement Settlement Register"
          subtitle="Track cash and bank payments remitted to employees against approved claims, reference numbers, and linked journal entries."
          actions={
            <button
              onClick={fetchReimbursements}
              className="inline-flex items-center px-3 py-2 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          }
        />

        {/* Search Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by remittance number, employee, UTR ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition"
            />
          </form>
          <span className="text-xs text-slate-400">Total {reimbursements.length} reimbursement vouchers</span>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingState message="Loading reimbursement vouchers..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchReimbursements} />
        ) : reimbursements.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
            <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-200 mb-1">No Reimbursements Found</h3>
            <p className="text-xs text-slate-400">No payment settlements matching your criteria.</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/60 text-xs uppercase text-slate-400 font-semibold border-b border-slate-700">
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
                <tbody className="divide-y divide-slate-800">
                  {reimbursements.map((reimb) => (
                    <tr key={reimb.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono text-purple-400 font-medium">{reimb.reimbursement_number}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400">
                        {reimb.claim ? (
                          <button
                            onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/claims/${reimb.claim_id}`)}
                            className="hover:underline flex items-center"
                          >
                            <FileText className="w-3.5 h-3.5 mr-1" />
                            {reimb.claim.claim_number}
                          </button>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-200">
                        {reimb.employee ? `${reimb.employee.first_name} ${reimb.employee.last_name}` : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{reimb.reimbursement_date}</td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">{reimb.payment_method.replace('_', ' ')}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-xs">{reimb.reference_number || '-'}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-purple-300">
                        {formatCurrency(reimb.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {reimb.status === 'POSTED' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            POSTED
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            VOIDED
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {reimb.status === 'POSTED' && (
                          <button
                            onClick={() => setVoidingId(reimb.id)}
                            className="inline-flex items-center text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded transition font-medium"
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
      </div>

      {/* Void Modal */}
      {voidingId && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <form onSubmit={handleVoidReimbursement} className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-100 flex items-center">
              <XCircle className="w-5 h-5 mr-2 text-rose-400" /> Void Reimbursement Voucher
            </h3>
            <p className="text-xs text-slate-400">
              Voiding will reverse the journal entry and reopen the outstanding balance on the expense claim.
            </p>
            <textarea
              rows={3}
              required
              placeholder="Reason for voiding..."
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-3 rounded-lg text-sm focus:outline-none focus:border-rose-500"
            />
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setVoidingId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={voidSubmitting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-semibold"
              >
                {voidSubmitting ? 'Voiding...' : 'Confirm Void'}
              </button>
            </div>
          </form>
        </div>
      )}
    </ERPLayout>
  );
};

export default ReimbursementListPage;
