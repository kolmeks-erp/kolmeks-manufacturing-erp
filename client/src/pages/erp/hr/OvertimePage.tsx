import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrOperationsService } from '../../../services/hr_operations.service';
import { OvertimeRecord } from '../../../types/hr_operations';
import {
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  DollarSign,
  AlertCircle,
  Calendar,
} from 'lucide-react';

export const OvertimePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [hourlyRateInput, setHourlyRateInput] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    overtime_date: new Date().toISOString().split('T')[0],
    hours: '',
    reason: '',
  });

  const { data: otData, isLoading } = useQuery({
    queryKey: ['overtimeRecords', statusFilter],
    queryFn: () => hrOperationsService.getOvertimeRecords({ status: statusFilter }),
  });

  const overtimeList: OvertimeRecord[] = otData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: { hours: number; reason: string; overtime_date: string }) =>
      hrOperationsService.createOvertimeRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overtimeRecords'] });
      setIsModalOpen(false);
      setFormData({ overtime_date: new Date().toISOString().split('T')[0], hours: '', reason: '' });
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, hourly_rate }: { id: string; hourly_rate?: number }) =>
      hrOperationsService.approveOvertimeRequest(id, hourly_rate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overtimeRecords'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, rejection_reason }: { id: string; rejection_reason?: string }) =>
      hrOperationsService.rejectOvertimeRequest(id, rejection_reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overtimeRecords'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hours || parseFloat(formData.hours) <= 0 || !formData.reason) return;
    createMutation.mutate({
      hours: parseFloat(formData.hours),
      reason: formData.reason,
      overtime_date: formData.overtime_date,
    });
  };

  const filteredList = overtimeList.filter((item) => {
    const empName = `${item.employee?.first_name || ''} ${item.employee?.last_name || ''}`.toLowerCase();
    const otNum = (item.overtime_number || '').toLowerCase();
    return empName.includes(searchTerm.toLowerCase()) || otNum.includes(searchTerm.toLowerCase());
  });

  const pendingCount = overtimeList.filter(o => o.status === 'PENDING').length;
  const approvedCount = overtimeList.filter(o => o.status === 'APPROVED').length;
  const totalApprovedHours = overtimeList
    .filter(o => o.status === 'APPROVED')
    .reduce((sum, o) => sum + (o.hours || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Overtime Management & Approvals
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Log, verify, and calculate extra working hours with automated rate formulas.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-sm gap-2"
        >
          <Plus className="w-4 h-4" /> Claim Overtime
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Requests</span>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{pendingCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Approved Claims</span>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{approvedCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Approved OT Hours</span>
            <Clock className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{totalApprovedHours.toFixed(1)} hrs</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Employee or OT #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Overtime Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="p-4">OT Ref #</th>
                <th className="p-4">Employee</th>
                <th className="p-4">Date</th>
                <th className="p-4">Hours</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Status</th>
                <th className="p-4">Rate (₹/hr)</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    Loading overtime records...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No overtime records found.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                      {item.overtime_number}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {item.employee?.first_name} {item.employee?.last_name}
                      </p>
                      <p className="text-xs text-slate-500">{item.employee?.department?.name || 'General'}</p>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{item.overtime_date}</td>
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">{item.hours} hrs</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">{item.reason}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          item.status === 'APPROVED'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : item.status === 'REJECTED'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {item.status === 'APPROVED' ? (
                        <span>₹{item.hourly_rate?.toFixed(2)}</span>
                      ) : (
                        <input
                          type="number"
                          placeholder="Auto / Custom"
                          value={hourlyRateInput[item.id] || ''}
                          onChange={(e) =>
                            setHourlyRateInput({ ...hourlyRateInput, [item.id]: e.target.value })
                          }
                          className="w-24 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                        />
                      )}
                    </td>
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      ₹{item.overtime_amount ? item.overtime_amount.toFixed(2) : '0.00'}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {item.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() =>
                              approveMutation.mutate({
                                id: item.id,
                                hourly_rate: hourlyRateInput[item.id] ? parseFloat(hourlyRateInput[item.id]) : undefined,
                              })
                            }
                            disabled={approveMutation.isPending}
                            className="inline-flex items-center p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs transition-colors"
                            title="Approve Overtime"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => rejectMutation.mutate({ id: item.id })}
                            disabled={rejectMutation.isPending}
                            className="inline-flex items-center p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs transition-colors"
                            title="Reject Overtime"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Overtime Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" /> Log Overtime Claim
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Overtime Date</label>
                <input
                  type="date"
                  value={formData.overtime_date}
                  onChange={(e) => setFormData({ ...formData, overtime_date: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Overtime Hours</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 2.5"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Reason / Justification</label>
                <textarea
                  rows={3}
                  placeholder="Factory production shift extension..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
                >
                  {createMutation.isPending ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
