import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Database,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  ShieldCheck,
  Layers,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { demoDataService } from '../../../services/demo_data.service';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { ConfirmDialog } from '../../../components/erp/ConfirmDialog';

interface ModuleEntityInfo {
  category: string;
  entity: string;
  key: string;
  target: string;
}

const MODULE_ENTITIES: ModuleEntityInfo[] = [
  { category: 'HR & Workforce', entity: 'Employees & Profiles', key: 'employees', target: '12 Parents' },
  { category: 'CRM & Sales', entity: 'Customers & Contacts', key: 'customers', target: '12 Parents' },
  { category: 'Procurement', entity: 'Suppliers & Vendors', key: 'suppliers', target: '12 Parents' },
  { category: 'Catalog', entity: 'Products & Materials', key: 'products', target: '12 Parents' },
  { category: 'CRM & Sales', entity: 'Leads Registry', key: 'leads', target: '12 Parents' },
  { category: 'CRM & Sales', entity: 'Sales Opportunities', key: 'opportunities', target: '12 Parents' },
  { category: 'Sales', entity: 'Sales Quotations & Lines', key: 'quotations', target: '12 Parents' },
  { category: 'Sales', entity: 'Sales Orders & Lines', key: 'salesOrders', target: '12 Parents' },
  { category: 'Procurement', entity: 'Purchase Requisitions', key: 'purchaseRequisitions', target: '12 Parents' },
  { category: 'Procurement', entity: 'RFQs & Supplier Bids', key: 'rfqs', target: '12 Parents' },
  { category: 'Procurement', entity: 'Purchase Orders & Lines', key: 'purchaseOrders', target: '12 Parents' },
  { category: 'Procurement', entity: 'Goods Receipts (GRN)', key: 'goodsReceipts', target: '12 Parents' },
  { category: 'Production', entity: 'Production Orders & WIP', key: 'productionOrders', target: '12 Parents' },
  { category: 'Assets & Maintenance', entity: 'Fixed Assets Master', key: 'fixedAssets', target: '12 Parents' },
  { category: 'Compliance', entity: 'Documents & Versions', key: 'documents', target: '12 Parents' },
  { category: 'Workflows', entity: 'Workflow Definitions', key: 'workflows', target: '12 Parents' },
  { category: 'Quality Assurance', entity: 'Quality Inspection Plans', key: 'inspectionPlans', target: '12 Parents' },
];

export const DemoDataManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Query Demo Status
  const {
    data: statusResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['demoDataStatus'],
    queryFn: () => demoDataService.getStatus(),
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: () => demoDataService.createDemoData(),
    onSuccess: (res) => {
      setFeedback({
        message: res.message || 'Demo Dataset Created Successfully!',
        type: 'success',
      });
      queryClient.invalidateQueries();
      refetch();
    },
    onError: (err: any) => {
      setFeedback({
        message: err?.response?.data?.error || 'Failed to create demo dataset.',
        type: 'error',
      });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => demoDataService.deleteDemoData(),
    onSuccess: (res) => {
      setFeedback({
        message: res.message || 'Demo Dataset Safely Deleted!',
        type: 'info',
      });
      setIsConfirmDeleteOpen(false);
      queryClient.invalidateQueries();
      refetch();
    },
    onError: (err: any) => {
      setFeedback({
        message: err?.response?.data?.error || 'Failed to delete demo dataset.',
        type: 'error',
      });
      setIsConfirmDeleteOpen(false);
    },
  });

  if (isLoading) {
    return <LoadingState label="Inspecting database & checking demo data status..." rows={6} />;
  }

  if (isError || !statusResponse) {
    return (
      <ErrorState
        title="Failed to Connect to Demo Data Service"
        message="Unable to verify demo dataset status from server backend API."
        onRetry={() => refetch()}
      />
    );
  }

  const counts = statusResponse.counts || ({} as any);
  const totalRecords = statusResponse.totalParentRecords || 0;
  const isSeeded = statusResponse.isSeeded;

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* HEADER */}
      <PageHeader
        title="Demo Data Management"
        description="Inspect, Seed, and Cleanly Reset Kolmeks ERP Demonstration Dataset across all 25 modules."
        badge="System Admin"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Status</span>
            </button>

            {isSeeded && (
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition-all border border-red-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Demo Data</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <PlusCircle className="w-4 h-4" />
              )}
              <span>{isSeeded ? 'Re-seed Demo Data' : 'Create Demo Data'}</span>
            </button>
          </div>
        }
      />

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : feedback.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-blue-600" />
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* METRIC OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Dataset Status</span>
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>{isSeeded ? 'SEEDED' : 'EMPTY'}</span>
            {isSeeded ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            {isSeeded ? 'Full demo environment active' : 'No demo records present'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Seeded Parent Records</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{totalRecords}</div>
          <p className="text-[11px] text-slate-500">Target ~12 parent records/entity</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Demo Prefix Tag</span>
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded-lg inline-block">
            DEMO-KOLMEKS-
          </div>
          <p className="text-[11px] text-slate-500">Isolates demo data from real records</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Production Safety</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-sm font-bold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>PROTECTED</span>
          </div>
          <p className="text-[11px] text-slate-500">No DROP/TRUNCATE allowed</p>
        </div>
      </div>

      {/* MODULE ENTITY COVERAGE TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Module Entity Coverage & Status</h3>
            <p className="text-xs text-slate-500">
              Overview of 10–12 parent entity records seeded per domain
            </p>
          </div>
          <div className="text-xs font-mono text-slate-500">
            Last Checked: {new Date(statusResponse.lastCheckedAt).toLocaleTimeString()}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                <th className="py-3 px-5">Module Category</th>
                <th className="py-3 px-5">Entity Name</th>
                <th className="py-3 px-5 text-center">Target</th>
                <th className="py-3 px-5 text-center">Seeded Count</th>
                <th className="py-3 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {MODULE_ENTITIES.map((mod) => {
                const count = (counts as any)[mod.key] || 0;
                const isPassed = count >= 10;
                return (
                  <tr key={mod.key} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-5 font-semibold text-slate-800">{mod.category}</td>
                    <td className="py-3 px-5 font-bold text-blue-900">{mod.entity}</td>
                    <td className="py-3 px-5 text-center font-mono text-slate-500">{mod.target}</td>
                    <td className="py-3 px-5 text-center font-mono font-bold text-slate-900">
                      {count}
                    </td>
                    <td className="py-3 px-5 text-right">
                      {isPassed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>PASS ({count})</span>
                        </span>
                      ) : count > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-lg border border-blue-200">
                          <span>SEEDED ({count})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-500 text-[11px] font-bold rounded-lg border border-slate-200">
                          <span>EMPTY</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        title="Delete Kolmeks ERP Demo Dataset?"
        message="This operation will safely delete ONLY demo records created with the DEMO-KOLMEKS- prefix. Actual user data and real business records will NOT be touched."
        confirmText="Yes, Delete Demo Data"
        cancelText="Cancel"
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />
    </div>
  );
};

export default DemoDataManagementPage;
