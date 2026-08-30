import { NavItem, ERPMenuItem, UserRoleName } from '../types';

export const ERP_BASE_PATH = '/secure-kolmeks-x0y0';

export const PUBLIC_NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  {
    label: 'Capabilities',
    href: '#capabilities',
    children: [
      { label: 'Contract Manufacturing', href: '/contract-manufacturing' },
      { label: 'CNC Machining', href: '/cnc-machining' },
      { label: 'Component Assembly', href: '/assembly' },
      { label: 'Electric Motors & Components', href: '/electric-motors' },
      { label: 'Supply Chain Solutions', href: '/supply-chain' },
    ],
  },
  { label: 'Quality & Testing', href: '/quality' },
  { label: 'Locations', href: '/locations' },
  { label: 'Careers', href: '/careers' },
  { label: 'News', href: '/news' },
  { label: 'Contact', href: '/contact' },
];

const ALL_ROLES: UserRoleName[] = [
  'admin',
  'hr',
  'finance',
  'finance_manager',
  'accountant',
  'manager',
  'sales_manager',
  'purchase_manager',
  'production_manager',
  'quality_manager',
  'warehouse_manager',
];

export const ERP_SIDEBAR_MENU: ERPMenuItem[] = [
  // Dashboard Core
  { id: 'dashboard', label: 'Executive Dashboard', path: `${ERP_BASE_PATH}/dashboard`, iconName: 'LayoutDashboard', category: 'core', roles: ALL_ROLES },
  
  // Sales Section
  { id: 'rfqs', label: 'RFQs Management', path: `${ERP_BASE_PATH}/rfqs`, iconName: 'FileText', category: 'Sales', badge: 'Live', roles: ['admin', 'sales_manager', 'production_manager', 'quality_manager'] },
  { id: 'quotations', label: 'Quotations', path: `${ERP_BASE_PATH}/quotations`, iconName: 'FileSpreadsheet', category: 'Sales', badge: 'Live', roles: ['admin', 'sales_manager'] },
  { id: 'sales-orders', label: 'Sales Orders', path: `${ERP_BASE_PATH}/sales-orders`, iconName: 'FileCheck', category: 'Sales', badge: 'Live', roles: ['admin', 'sales_manager', 'executive'] },
  { id: 'sales-invoices', label: 'Sales Invoices', path: `${ERP_BASE_PATH}/sales/invoices`, iconName: 'FileText', category: 'Sales', badge: 'Live', roles: ['admin', 'sales_manager', 'finance', 'accountant', 'executive'] },
  { id: 'customers', label: 'Customers', path: `${ERP_BASE_PATH}/customers`, iconName: 'Users', category: 'Sales', badge: 'Live', roles: ['admin', 'sales_manager'] },

  // Procurement Section
  { id: 'suppliers', label: 'Suppliers', path: `${ERP_BASE_PATH}/suppliers`, iconName: 'Truck', category: 'Procurement', badge: 'Live', roles: ['admin', 'purchase_manager', 'warehouse_manager'] },
  { id: 'purchase-requisitions', label: 'Purchase Requisitions', path: `${ERP_BASE_PATH}/purchase-requisitions`, iconName: 'ClipboardList', category: 'Procurement', badge: 'Live', roles: ['admin', 'purchase_manager', 'warehouse_manager', 'executive'] },
  { id: 'purchase-orders', label: 'Purchase Orders', path: `${ERP_BASE_PATH}/purchase-orders`, iconName: 'Receipt', category: 'Procurement', badge: 'Live', roles: ['admin', 'purchase_manager', 'warehouse_manager', 'executive'] },
  { id: 'goods-receipts', label: 'Goods Receipts (GRN)', path: `${ERP_BASE_PATH}/goods-receipts`, iconName: 'PackageCheck', category: 'Procurement', badge: 'Live', roles: ['admin', 'purchase_manager', 'warehouse_manager', 'executive'] },
  { id: 'purchase-invoices', label: 'Purchase Invoices', path: `${ERP_BASE_PATH}/purchases/invoices`, iconName: 'FileText', category: 'Procurement', badge: 'Live', roles: ['admin', 'purchase_manager', 'finance', 'accountant', 'executive'] },

  // Products Section
  { id: 'products', label: 'Products Master', path: `${ERP_BASE_PATH}/products`, iconName: 'Package', category: 'Products', badge: 'Live', roles: ['admin', 'production_manager', 'sales_manager', 'quality_manager'] },
  { id: 'product-categories', label: 'Product Categories', path: `${ERP_BASE_PATH}/product-categories`, iconName: 'FolderTree', category: 'Products', badge: 'Live', roles: ['admin', 'production_manager', 'sales_manager', 'quality_manager'] },
  { id: 'materials', label: 'Raw Materials', path: `${ERP_BASE_PATH}/materials`, iconName: 'Boxes', category: 'Products', roles: ['admin', 'purchase_manager', 'production_manager'] },

  // Inventory Section
  { id: 'inventory', label: 'Inventory Balances', path: `${ERP_BASE_PATH}/inventory`, iconName: 'Boxes', category: 'Inventory', badge: 'Live', roles: ['admin', 'warehouse_manager', 'purchase_manager', 'production_manager', 'executive'] },
  { id: 'stock-movements', label: 'Stock Movements', path: `${ERP_BASE_PATH}/inventory/movements`, iconName: 'History', category: 'Inventory', badge: 'Live', roles: ['admin', 'warehouse_manager', 'purchase_manager', 'production_manager', 'executive'] },
  { id: 'warehouses', label: 'Warehouses & Bins', path: `${ERP_BASE_PATH}/warehouses`, iconName: 'Building2', category: 'Inventory', badge: 'Live', roles: ['admin', 'warehouse_manager', 'purchase_manager', 'production_manager', 'executive'] },

  // Production Section
  { id: 'production-dashboard', label: 'Production Overview', path: `${ERP_BASE_PATH}/production`, iconName: 'Factory', category: 'Production', badge: 'Live', roles: ['admin', 'production_manager', 'quality_manager', 'warehouse_manager', 'executive'] },
  { id: 'production-orders', label: 'Production Orders', path: `${ERP_BASE_PATH}/production/orders`, iconName: 'Layers', category: 'Production', badge: 'Live', roles: ['admin', 'production_manager', 'quality_manager', 'warehouse_manager', 'executive'] },
  { id: 'production-boms', label: 'Bills of Materials (BOM)', path: `${ERP_BASE_PATH}/production/boms`, iconName: 'FolderTree', category: 'Production', badge: 'Live', roles: ['admin', 'production_manager', 'quality_manager', 'executive'] },
  { id: 'production-routings', label: 'Routings & Operations', path: `${ERP_BASE_PATH}/production/routings`, iconName: 'GitFork', category: 'Production', badge: 'Live', roles: ['admin', 'production_manager', 'quality_manager', 'executive'] },
  { id: 'production-dispatch', label: 'Shop Floor Dispatch', path: `${ERP_BASE_PATH}/production/operations-board`, iconName: 'Play', category: 'Production', badge: 'Live', roles: ['admin', 'production_manager', 'warehouse_manager'] },

  // Quality Management Section
  { id: 'quality-dashboard', label: 'Quality Overview', path: `${ERP_BASE_PATH}/quality`, iconName: 'ShieldCheck', category: 'Quality', badge: 'Live', roles: ['admin', 'quality_manager', 'production_manager', 'warehouse_manager', 'executive'] },
  { id: 'quality-inspections', label: 'Inspections', path: `${ERP_BASE_PATH}/quality/inspections`, iconName: 'ClipboardCheck', category: 'Quality', badge: 'Live', roles: ['admin', 'quality_manager', 'production_manager', 'warehouse_manager', 'executive'] },
  { id: 'quality-plans', label: 'Inspection Plans', path: `${ERP_BASE_PATH}/quality/inspection-plans`, iconName: 'FileSpreadsheet', category: 'Quality', badge: 'Live', roles: ['admin', 'quality_manager', 'production_manager', 'executive'] },
  { id: 'quality-ncr', label: 'Non-Conformance (NCR)', path: `${ERP_BASE_PATH}/quality/ncr`, iconName: 'AlertTriangle', category: 'Quality', badge: 'Live', roles: ['admin', 'quality_manager', 'production_manager', 'warehouse_manager', 'executive'] },
  { id: 'quality-holds', label: 'Quality Holds', path: `${ERP_BASE_PATH}/quality/holds`, iconName: 'Lock', category: 'Quality', badge: 'Live', roles: ['admin', 'quality_manager', 'production_manager', 'warehouse_manager', 'executive'] },

  // Maintenance & Asset Management Section
  { id: 'maintenance-dashboard', label: 'Maintenance Overview', path: `${ERP_BASE_PATH}/maintenance`, iconName: 'Wrench', category: 'Maintenance', badge: 'Live', roles: ['admin', 'maintenance_manager', 'maintenance_technician', 'production_manager', 'quality_manager', 'executive'] },
  { id: 'maintenance-assets', label: 'Asset Master', path: `${ERP_BASE_PATH}/maintenance/assets`, iconName: 'Layers', category: 'Maintenance', badge: 'Live', roles: ['admin', 'maintenance_manager', 'maintenance_technician', 'production_manager', 'executive'] },
  { id: 'maintenance-work-orders', label: 'Work Orders', path: `${ERP_BASE_PATH}/maintenance/work-orders`, iconName: 'ClipboardList', category: 'Maintenance', badge: 'Live', roles: ['admin', 'maintenance_manager', 'maintenance_technician', 'production_manager', 'executive'] },
  { id: 'maintenance-schedules', label: 'PM Schedules', path: `${ERP_BASE_PATH}/maintenance/schedules`, iconName: 'Clock', category: 'Maintenance', badge: 'Live', roles: ['admin', 'maintenance_manager', 'production_manager', 'executive'] },
  { id: 'maintenance-requests', label: 'Issue Tickets', path: `${ERP_BASE_PATH}/maintenance/requests`, iconName: 'AlertTriangle', category: 'Maintenance', badge: 'Live', roles: ['admin', 'maintenance_manager', 'maintenance_technician', 'production_manager', 'executive'] },
  { id: 'maintenance-downtime', label: 'Downtime Monitor', path: `${ERP_BASE_PATH}/maintenance/downtime`, iconName: 'Timer', category: 'Maintenance', badge: 'Live', roles: ['admin', 'maintenance_manager', 'production_manager', 'executive'] },
  { id: 'maintenance-history', label: 'Audit History', path: `${ERP_BASE_PATH}/maintenance/history`, iconName: 'ShieldCheck', category: 'Maintenance', badge: 'Live', roles: ['admin', 'maintenance_manager', 'production_manager', 'executive'] },

  // Machines & Capacity Section
  { id: 'work-centers', label: 'Work Centers', path: `${ERP_BASE_PATH}/production/work-centers`, iconName: 'Building2', category: 'Machines', badge: 'Live', roles: ['admin', 'production_manager'] },
  { id: 'cnc-machines', label: 'Machine Master', path: `${ERP_BASE_PATH}/production/machines`, iconName: 'Cpu', category: 'Machines', badge: 'Live', roles: ['admin', 'production_manager'] },

  // HR Operations Section
  { id: 'hr-dashboard', label: 'HR Operations', path: `${ERP_BASE_PATH}/hr`, iconName: 'Users', category: 'HR & Operations', badge: 'Live', roles: ['admin', 'hr'] },
  { id: 'hr-employees', label: 'Workforce Directory', path: `${ERP_BASE_PATH}/hr/employees`, iconName: 'UserCheck', category: 'HR & Operations', badge: 'Live', roles: ['admin', 'hr'] },
  { id: 'hr-attendance', label: 'Attendance Registry', path: `${ERP_BASE_PATH}/hr/attendance`, iconName: 'Clock', category: 'HR & Operations', badge: 'Live', roles: ['admin', 'hr'] },
  { id: 'hr-leave-requests', label: 'Leave Requests Queue', path: `${ERP_BASE_PATH}/hr/leave/requests`, iconName: 'CalendarRange', category: 'HR & Operations', badge: 'Live', roles: ['admin', 'hr'] },
  { id: 'hr-leave-balances', label: 'Leave Entitlements', path: `${ERP_BASE_PATH}/hr/leave`, iconName: 'Calendar', category: 'HR & Operations', badge: 'Live', roles: ['admin', 'hr'] },
  { id: 'hr-leave-types', label: 'Leave Policies', path: `${ERP_BASE_PATH}/hr/leave/types`, iconName: 'FileSpreadsheet', category: 'HR & Operations', badge: 'Live', roles: ['admin', 'hr'] },
  { id: 'hr-shifts', label: 'Shift Management', path: `${ERP_BASE_PATH}/hr/shifts`, iconName: 'Timer', category: 'HR & Operations', badge: 'Live', roles: ['admin', 'hr'] },
  { id: 'hr-holidays', label: 'Plant Holiday Calendar', path: `${ERP_BASE_PATH}/hr/holidays`, iconName: 'Calendar', category: 'HR & Operations', badge: 'Live', roles: ['admin', 'hr'] },

  // Finance & Accounting Section
  { id: 'finance-dashboard', label: 'Finance Dashboard', path: `${ERP_BASE_PATH}/finance`, iconName: 'DollarSign', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager'] },
  { id: 'finance-budgets', label: 'Budgets Overview', path: `${ERP_BASE_PATH}/finance/budgets`, iconName: 'PieChart', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager', 'executive'] },
  { id: 'finance-budget-list', label: 'Budget Register', path: `${ERP_BASE_PATH}/finance/budgets/list`, iconName: 'FileSpreadsheet', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager', 'executive'] },
  { id: 'finance-cost-centers', label: 'Cost Centers', path: `${ERP_BASE_PATH}/finance/cost-centers`, iconName: 'Building2', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager', 'executive'] },
  { id: 'finance-budget-approvals', label: 'Budget Approvals', path: `${ERP_BASE_PATH}/finance/budgets/approvals`, iconName: 'CheckCircle', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'finance_manager'] },
  { id: 'finance-receivables', label: 'Accounts Receivable', path: `${ERP_BASE_PATH}/finance/receivables`, iconName: 'DollarSign', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager'] },
  { id: 'finance-payables', label: 'Accounts Payable', path: `${ERP_BASE_PATH}/finance/payables`, iconName: 'CreditCard', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager'] },
  { id: 'finance-supplier-payments', label: 'Supplier Payments', path: `${ERP_BASE_PATH}/finance/supplier-payments`, iconName: 'CreditCard', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager'] },
  { id: 'finance-payable-aging', label: 'Payable Aging', path: `${ERP_BASE_PATH}/finance/payables/aging`, iconName: 'BarChart2', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager'] },
  { id: 'finance-payments', label: 'Customer Payments', path: `${ERP_BASE_PATH}/finance/payments`, iconName: 'CreditCard', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager'] },
  { id: 'finance-aging', label: 'Receivable Aging', path: `${ERP_BASE_PATH}/finance/receivables/aging`, iconName: 'BarChart2', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager'] },
  { id: 'finance-accounts', label: 'Chart of Accounts', path: `${ERP_BASE_PATH}/finance/accounts`, iconName: 'FolderTree', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager'] },
  { id: 'finance-journal-entries', label: 'Journal Entries', path: `${ERP_BASE_PATH}/finance/journal-entries`, iconName: 'FileText', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager'] },
  { id: 'finance-general-ledger', label: 'General Ledger', path: `${ERP_BASE_PATH}/finance/general-ledger`, iconName: 'BookOpen', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager'] },
  { id: 'finance-periods', label: 'Financial Periods', path: `${ERP_BASE_PATH}/finance/periods`, iconName: 'Calendar', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager'] },
  { id: 'finance-trial-balance', label: 'Trial Balance', path: `${ERP_BASE_PATH}/finance/trial-balance`, iconName: 'Scale', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager'] },
  { id: 'finance-profit-loss', label: 'Profit & Loss (P&L)', path: `${ERP_BASE_PATH}/finance/profit-loss`, iconName: 'TrendingUp', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager'] },
  { id: 'finance-balance-sheet', label: 'Balance Sheet', path: `${ERP_BASE_PATH}/finance/balance-sheet`, iconName: 'PieChart', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager'] },

  // Employee Self-Service Section
  { id: 'my-hr', label: 'Employee Portal (My HR)', path: `${ERP_BASE_PATH}/my-hr`, iconName: 'UserCheck', category: 'Self Service', badge: 'Live', roles: ALL_ROLES },
  { id: 'my-attendance', label: 'My Attendance Logs', path: `${ERP_BASE_PATH}/my-hr/attendance`, iconName: 'Clock', category: 'Self Service', badge: 'Live', roles: ALL_ROLES },
  { id: 'my-leave', label: 'My Leave Applications', path: `${ERP_BASE_PATH}/my-hr/leave`, iconName: 'Calendar', category: 'Self Service', badge: 'Live', roles: ALL_ROLES },

  // System & Management
  { id: 'employees', label: 'Employees & HR Master', path: `${ERP_BASE_PATH}/employees`, iconName: 'Users', category: 'Management', badge: 'Live', roles: ['admin', 'hr'] },
  { id: 'users', label: 'Employees & Access', path: `${ERP_BASE_PATH}/users`, iconName: 'UserCheck', category: 'Management', roles: ['admin'] },
  { id: 'reports', label: 'Reports', path: `${ERP_BASE_PATH}/reports`, iconName: 'BarChart3', category: 'Management', roles: ALL_ROLES },
  { id: 'settings', label: 'Settings', path: `${ERP_BASE_PATH}/settings`, iconName: 'Settings', category: 'Management', roles: ['admin'] },
];
