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
    return <LoadingState message="Loading Chart of Accounts & Cost Center lists..." />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
        </button>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Create New Operating Budget</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Define financial targets, assign GL expense/revenue accounts to cost centers, and establish budget control baselines.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2.5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Header Card */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Budget Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-1.5">
                Budget Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. FY2026 Plant Operating Budget"
                value={budgetName}
                onChange={(e) => setBudgetName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-1.5">
                Financial Period <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={periodId}
                onChange={(e) => setPeriodId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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
              <label className="block text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-1.5">
                Budget Owner / Manager
              </label>
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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
              <label className="block text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-1.5">Description / Notes</label>
              <input
                type="text"
                placeholder="Optional context or strategic goals..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Budget Lines Card */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Budget Lines Editor</h3>
              <p className="text-xs text-slate-500">Map expense or revenue GL accounts to specific cost centers</p>
            </div>
            <button
              type="button"
              onClick={handleAddLine}
              className="inline-flex items-center text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Line
            </button>
          </div>

          <div className="space-y-3">
            {lines.map((line, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Account <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={line.account_id}
                    onChange={(e) => handleLineChange(idx, 'account_id', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cost Center</label>
                  <select
                    value={line.cost_center_id || ''}
                    onChange={(e) => handleLineChange(idx, 'cost_center_id', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={line.budget_amount}
                    onChange={(e) => handleLineChange(idx, 'budget_amount', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 font-mono text-right focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Notes</label>
                  <input
                    type="text"
                    placeholder="Notes..."
                    value={line.notes || ''}
                    onChange={(e) => handleLineChange(idx, 'notes', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="md:col-span-1 text-center pt-3 md:pt-0">
                  <button
                    type="button"
                    disabled={lines.length === 1}
                    onClick={() => handleRemoveLine(idx)}
                    className="text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total Calculation Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">Lines count: {lines.length}</div>
            <div className="text-right">
              <span className="text-[11px] uppercase text-slate-400 font-bold tracking-wider mr-3">Total Calculated Budget:</span>
              <span className="text-xl font-bold font-mono text-emerald-600">{formatCurrency(totalBudgetCalculated)}</span>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {saving ? 'Saving Budget...' : 'Save Draft Budget'}
          </button>
        </div>
      </form>
    </div>
  );
};
