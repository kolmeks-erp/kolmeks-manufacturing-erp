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
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hasData: true,
    },
    {
      title: 'Products Master',
      value: metrics && metrics.totalProducts !== undefined ? metrics.totalProducts.toString() : '0',
      subtext: metrics?.activeProducts !== undefined ? `${metrics.activeProducts} active product(s)` : 'Connected to Products database',
      icon: Boxes,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      hasData: true,
    },
    {
      title: 'Customers Master',
      value: metrics && metrics.totalCustomers !== undefined ? metrics.totalCustomers.toString() : '0',
      subtext: metrics?.activeCustomers !== undefined ? `${metrics.activeCustomers} active client(s)` : 'Connected to Customer database',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hasData: true,
    },
    {
      title: 'Suppliers Master',
      value: metrics && metrics.totalSuppliers !== undefined ? metrics.totalSuppliers.toString() : '0',
      subtext: metrics?.activeSuppliers !== undefined ? `${metrics.activeSuppliers} active vendor(s)` : 'Connected to Supplier database',
      icon: Truck,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      hasData: true,
    },
    {
      title: 'Active Quotations',
      value: 'No data available',
      subtext: 'Quotations module pending',
      icon: FileSpreadsheet,
      color: 'text-slate-400',
      bgColor: 'bg-slate-100',
      hasData: false,
    },
    {
      title: 'Open Sales Orders',
      value: 'No data available',
      subtext: 'Sales orders module pending',
      icon: ShoppingCart,
      color: 'text-slate-400',
      bgColor: 'bg-slate-100',
      hasData: false,
    },
    {
      title: 'Production Orders',
      value: 'No data available',
      subtext: 'Production scheduler pending',
      icon: Factory,
      color: 'text-slate-400',
      bgColor: 'bg-slate-100',
      hasData: false,
    },
    {
      title: 'Quality Issues',
      value: 'No data available',
      subtext: 'Quality control pending',
      icon: ShieldCheck,
      color: 'text-slate-400',
      bgColor: 'bg-slate-100',
      hasData: false,
    },
    {
      title: 'Machines Requiring Attention',
      value: 'No data available',
      subtext: 'CNC hub & maintenance pending',
      icon: Cpu,
      color: 'text-slate-400',
      bgColor: 'bg-slate-100',
      hasData: false,
    },
    {
      title: 'Pending Purchase Orders',
      value: 'No data available',
      subtext: 'Procurement module pending',
      icon: Receipt,
      color: 'text-slate-400',
      bgColor: 'bg-slate-100',
      hasData: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {kpiItems.map((item, idx) => {
        const Icon = item.icon;

        return (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{item.title}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bgColor} ${item.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              {isLoading ? (
                <div className="h-8 bg-slate-200 rounded animate-pulse w-1/2" />
              ) : (
                <div
                  className={`font-mono tracking-tight font-black ${
                    item.hasData ? 'text-2xl text-[#0B1E36]' : 'text-sm text-slate-400 italic'
                  }`}
                >
                  {item.value}
                </div>
              )}
              <p className="text-[11px] text-slate-500 font-mono">{item.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
