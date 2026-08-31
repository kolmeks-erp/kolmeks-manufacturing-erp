import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  ShoppingCart,
  Boxes,
  Users,
  Truck,
  Factory,
  ShieldCheck,
  Cpu,
  Receipt,
} from 'lucide-react';

interface MetricsData {
  totalRfqs: number;
  newRfqs: number;
  totalProducts?: number;
  activeProducts?: number;
  totalCustomers?: number;
  activeCustomers?: number;
  totalSuppliers?: number;
  activeSuppliers?: number;
  activeQuotations: number;
  openSalesOrders: number;
  lowStockItems: number;
  productionOrders: number;
  qualityIssues: number;
  machinesAttention: number;
  pendingPurchaseOrders: number;
}

interface DashboardKPIGridProps {
  metrics?: MetricsData;
  isLoading?: boolean;
}

export const DashboardKPIGrid: React.FC<DashboardKPIGridProps> = ({ metrics, isLoading }) => {
  const kpiItems = [
    {
      title: 'Open RFQs',
      value: metrics ? metrics.totalRfqs.toString() : '0',
      subtext: metrics?.newRfqs ? `${metrics.newRfqs} new request(s)` : 'Connected to RFQ database',
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-500/20',
      hasData: true,
    },
    {
      title: 'Products Master',
      value: metrics && metrics.totalProducts !== undefined ? metrics.totalProducts.toString() : '0',
      subtext: metrics?.activeProducts !== undefined ? `${metrics.activeProducts} active product(s)` : 'Connected to Products database',
      icon: Boxes,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/20',
      hasData: true,
    },
    {
      title: 'Customers Master',
      value: metrics && metrics.totalCustomers !== undefined ? metrics.totalCustomers.toString() : '0',
      subtext: metrics?.activeCustomers !== undefined ? `${metrics.activeCustomers} active client(s)` : 'Connected to Customer database',
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-500/20',
      hasData: true,
    },
    {
      title: 'Suppliers Master',
      value: metrics && metrics.totalSuppliers !== undefined ? metrics.totalSuppliers.toString() : '0',
      subtext: metrics?.activeSuppliers !== undefined ? `${metrics.activeSuppliers} active vendor(s)` : 'Connected to Supplier database',
      icon: Truck,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-500/20',
      hasData: true,
    },
    {
      title: 'Active Quotations',
      value: metrics && metrics.activeQuotations !== undefined ? metrics.activeQuotations.toString() : '0',
      subtext: metrics?.activeQuotations !== undefined ? `${metrics.activeQuotations} approved/sent quotation(s)` : 'Connected to Quotations DB',
      icon: FileSpreadsheet,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-500/20',
      hasData: true,
    },
    {
      title: 'Open Sales Orders',
      value: metrics && metrics.openSalesOrders !== undefined ? metrics.openSalesOrders.toString() : '0',
      subtext: metrics?.openSalesOrders !== undefined ? `${metrics.openSalesOrders} active sales order(s)` : 'Connected to Orders DB',
      icon: ShoppingCart,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-500/20',
      hasData: true,
    },
    {
      title: 'Production Orders',
      value: metrics && metrics.productionOrders !== undefined ? metrics.productionOrders.toString() : '0',
      subtext: 'Master production scheduler online',
      icon: Factory,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-500/20',
      hasData: true,
    },
    {
      title: 'Quality Issues',
      value: metrics && metrics.qualityIssues !== undefined ? metrics.qualityIssues.toString() : '0',
      subtext: 'Quality assurance & NCR tracking online',
      icon: ShieldCheck,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-500/20',
      hasData: true,
    },
    {
      title: 'Machines Attention',
      value: metrics && metrics.machinesAttention !== undefined ? metrics.machinesAttention.toString() : '0',
      subtext: 'Preventive maintenance tracking online',
      icon: Cpu,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-500/20',
      hasData: true,
    },
    {
      title: 'Pending Purchase Orders',
      value: metrics && metrics.pendingPurchaseOrders !== undefined ? metrics.pendingPurchaseOrders.toString() : '0',
      subtext: metrics?.pendingPurchaseOrders !== undefined ? `${metrics.pendingPurchaseOrders} PO(s) awaiting approval` : 'Procurement module online',
      icon: Receipt,
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-50 dark:bg-violet-500/20',
      hasData: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {kpiItems.map((item, idx) => {
        const Icon = item.icon;

        return (
          <div
            key={idx}
            className="bg-white dark:bg-[#0F2647] p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{item.title}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bgColor} ${item.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              {isLoading ? (
                <div className="h-8 bg-slate-200 dark:bg-slate-700/60 rounded animate-pulse w-1/2" />
              ) : (
                <div
                  className={`font-mono tracking-tight font-black ${
                    item.hasData ? 'text-2xl text-slate-900 dark:text-white' : 'text-sm text-slate-400 dark:text-slate-500 italic'
                  }`}
                >
                  {item.value}
                </div>
              )}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{item.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
