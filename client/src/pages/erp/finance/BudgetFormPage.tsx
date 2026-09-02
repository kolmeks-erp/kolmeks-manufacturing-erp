import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, IndianRupee, AlertTriangle } from 'lucide-react';
import { ERPLayout } from '../../../layouts/ERPLayout';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { LoadingState } from '../../../components/erp/LoadingState';
import { budgetingService } from '../../../services/budgeting.service';
import { financeService } from '../../../services/finance.service';
import { employeeService } from '../../../services/employee.service';
import { CostCenter } from '../../../types/budgeting';
import { Account, FinancialPeriod } from '../../../types/finance';
import { Employee } from '../../../types/employee';
import { ERP_BASE_PATH } from '../../../constants/navigation';

interface LineItemForm {
  account_id: string;
  cost_center_id?: string;
  budget_amount: number;
  notes?: string;
}

export const BudgetFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Dropdown Options
  const [periods, setPeriods] = useState<FinancialPeriod[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Header Fields
  const [budgetName, setBudgetName] = useState<string>('');
  const [periodId, setPeriodId] = useState<string>('');
  const [ownerId, setOwnerId] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Line Items
  const [lines, setLines] = useState<LineItemForm[]>([
    { account_id: '', cost_center_id: '', budget_amount: 0, notes: '' },
  ]);

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        setLoading(true);
        const [periodsData, accountsData, centersData, empData] = await Promise.all([
          financeService.getFinancialPeriods(),
          financeService.getAccounts({ status: 'ACTIVE' }),
          budgetingService.getCostCenters({ is_active: true }),
          employeeService.getEmployees({ limit: 100 }),
        ]);

        const pList = Array.isArray(periodsData) ? periodsData : (periodsData as any)?.data || [];
        const aList = Array.isArray(accountsData) ? accountsData : (accountsData as any)?.data || [];
        const cList = Array.isArray(centersData) ? centersData : (centersData as any)?.data || [];
        const eList = Array.isArray(empData) ? empData : (empData as any)?.data || [];

        setPeriods(pList);
        const openPeriod = pList.find((p: any) => p.status === 'OPEN');
        if (openPeriod) setPeriodId(openPeriod.id);

        setAccounts(aList);
        setCostCenters(cList);
        setEmployees(eList);
      } catch (err: any) {
        console.error('Failed to load budget form dependencies:', err);
        setError('Failed to load Chart of Accounts or Cost Centers.');
      } finally {
        setLoading(false);
      }
    };
    loadMasterData();
  }, []);

  const handleAddLine = () => {
    setLines([...lines, { account_id: '', cost_center_id: '', budget_amount: 0, notes: '' }]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: keyof LineItemForm, value: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  const totalBudgetCalculated = lines.reduce((acc, l) => acc + (parseFloat(l.budget_amount as any) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetName.trim()) {
      setError('Please provide a Budget Name.');
      return;
    }
    if (!periodId) {
      setError('Please select a Financial Period.');
      return;
    }

    const invalidLine = lines.find((l) => !l.account_id || (l.budget_amount || 0) < 0);
    if (invalidLine) {
      setError('Each line must have a valid Account selected and a non-negative budget amount.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const res = await budgetingService.createBudget({
        budget_name: budgetName.trim(),
        period_id: periodId,
        owner_id: ownerId || null,
        description: description.trim() || null,
        lines: lines.map((l) => ({
          account_id: l.account_id,
          cost_center_id: l.cost_center_id || null,
          budget_amount: parseFloat(l.budget_amount as any) || 0,
          notes: l.notes || null,
        })),
      });

      if (res.success) {
        navigate(`${ERP_BASE_PATH}/finance/budgets/${res.data.id}`);
      }
    } catch (err: any) {
      console.error('Error creating budget:', err);
      setError(err?.response?.data?.message || 'Failed to create budget.');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  if (loading) {
    return (
      <ERPLayout activeTab="finance">
        <LoadingState message="Loading Chart of Accounts & Cost Center lists..." />
      </ERPLayout>
    );
  }

  return (
    <ERPLayout activeTab="finance">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </button>
        </div>

        <ERPPageHeader
          title="Create New Operating Budget"
          subtitle="Define financial targets, assign GL expense/revenue accounts to cost centers, and establish budget control baselines."
        />

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-sm text-rose-400 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-slate-100 border-b border-slate-800 pb-3">Budget Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Budget Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FY2026 Plant Operating Budget"
                  value={budgetName}
                  onChange={(e) => setBudgetName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Financial Period <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={periodId}
                  onChange={(e) => setPeriodId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Select Period --</option>
                  {periods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.period_name} ({p.start_date} to {p.end_date}) [{p.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Budget Owner / Manager
                </label>
                <select
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Unassigned --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({typeof emp.department === 'object' ? (emp.department as any)?.name : (emp.department || 'Staff')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Description / Notes</label>
                <input
                  type="text"
                  placeholder="Optional context or strategic goals..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Budget Lines Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-100">Budget Lines Editor</h3>
                <p className="text-xs text-slate-400">Map expense or revenue GL accounts to specific cost centers</p>
              </div>
              <button
                type="button"
                onClick={handleAddLine}
                className="inline-flex items-center text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Line
              </button>
            </div>

            <div className="space-y-3">
              {lines.map((line, idx) => (
                <div key={idx} className="p-3 bg-slate-800/60 border border-slate-700/80 rounded-lg grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-4">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                      Account <span className="text-rose-400">*</span>
                    </label>
                    <select
                      required
                      value={line.account_id}
                      onChange={(e) => handleLineChange(idx, 'account_id', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">-- Select GL Account --</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.account_code} - {a.account_name} ({a.account_type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Cost Center</label>
                    <select
                      value={line.cost_center_id || ''}
                      onChange={(e) => handleLineChange(idx, 'cost_center_id', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">-- General Overhead --</option>
                      {costCenters.map((cc) => (
                        <option key={cc.id} value={cc.id}>
                          {cc.code} - {cc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                      Amount (₹) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      required
                      value={line.budget_amount}
                      onChange={(e) => handleLineChange(idx, 'budget_amount', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 font-mono text-right focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Notes</label>
                    <input
                      type="text"
                      placeholder="Notes..."
                      value={line.notes || ''}
                      onChange={(e) => handleLineChange(idx, 'notes', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="md:col-span-1 text-center pt-3 md:pt-0">
                    <button
                      type="button"
                      disabled={lines.length === 1}
                      onClick={() => handleRemoveLine(idx)}
                      className="text-slate-500 hover:text-rose-400 disabled:opacity-30 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Calculation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div className="text-xs text-slate-400">Lines count: {lines.length}</div>
              <div className="text-right">
                <span className="text-xs uppercase text-slate-400 font-semibold mr-3">Total Calculated Budget:</span>
                <span className="text-xl font-bold font-mono text-emerald-400">{formatCurrency(totalBudgetCalculated)}</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg text-sm font-semibold hover:from-emerald-500 hover:to-teal-500 shadow-md transition disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving Budget...' : 'Save Draft Budget'}
            </button>
          </div>
        </form>
      </div>
    </ERPLayout>
  );
};
