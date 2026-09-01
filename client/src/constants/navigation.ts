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
  { id: 'inventory-overview', label: 'Inventory Overview', path: `${ERP_BASE_PATH}/inventory`, iconName: 'BarChart2', category: 'Inventory', badge: 'Live', roles: ['admin', 'warehouse_manager', 'inventory_manager', 'purchase_manager', 'production_manager', 'executive'] },
  { id: 'inventory-stock', label: 'Stock Balances', path: `${ERP_BASE_PATH}/inventory/stock`, iconName: 'Boxes', category: 'Inventory', badge: 'Live', roles: ['admin', 'warehouse_manager', 'inventory_manager', 'purchase_manager', 'production_manager', 'executive'] },
  { id: 'inventory-warehouses', label: 'Warehouses & Bins', path: `${ERP_BASE_PATH}/inventory/warehouses`, iconName: 'Building2', category: 'Inventory', badge: 'Live', roles: ['admin', 'warehouse_manager', 'inventory_manager', 'executive'] },
  { id: 'inventory-movements', label: 'Stock Movements', path: `${ERP_BASE_PATH}/inventory/movements`, iconName: 'History', category: 'Inventory', badge: 'Live', roles: ['admin', 'warehouse_manager', 'inventory_manager', 'executive'] },
  { id: 'inventory-transfers', label: 'Stock Transfers', path: `${ERP_BASE_PATH}/inventory/transfers`, iconName: 'RefreshCw', category: 'Inventory', badge: 'Live', roles: ['admin', 'warehouse_manager', 'inventory_manager', 'executive'] },
  { id: 'inventory-adjustments', label: 'Stock Adjustments', path: `${ERP_BASE_PATH}/inventory/adjustments`, iconName: 'Sliders', category: 'Inventory', badge: 'Live', roles: ['admin', 'warehouse_manager', 'inventory_manager', 'executive'] },
  { id: 'inventory-reservations', label: 'Stock Reservations', path: `${ERP_BASE_PATH}/inventory/reservations`, iconName: 'Lock', category: 'Inventory', badge: 'Live', roles: ['admin', 'warehouse_manager', 'inventory_manager', 'sales_manager', 'production_manager', 'executive'] },
  { id: 'inventory-batches', label: 'Batch / Lot Register', path: `${ERP_BASE_PATH}/inventory/batches`, iconName: 'Package', category: 'Inventory', badge: 'Live', roles: ['admin', 'warehouse_manager', 'inventory_manager', 'quality_manager', 'executive'] },
  { id: 'inventory-serials', label: 'Serial Numbers', path: `${ERP_BASE_PATH}/inventory/serial-numbers`, iconName: 'Barcode', category: 'Inventory', badge: 'Live', roles: ['admin', 'warehouse_manager', 'inventory_manager', 'quality_manager', 'executive'] },
  { id: 'inventory-reorder', label: 'Reorder & Replenishment', path: `${ERP_BASE_PATH}/inventory/reorder`, iconName: 'TrendingUp', category: 'Inventory', badge: 'Live', roles: ['admin', 'warehouse_manager', 'inventory_manager', 'purchase_manager', 'executive'] },
  { id: 'inventory-reports', label: 'Valuation & Reports', path: `${ERP_BASE_PATH}/inventory/reports`, iconName: 'PieChart', category: 'Inventory', badge: 'Live', roles: ['admin', 'warehouse_manager', 'inventory_manager', 'finance_manager', 'executive'] },

  // Production Section
  { id: 'production-dashboard', label: 'Production Overview', path: `${ERP_BASE_PATH}/production`, iconName: 'Factory', category: 'Production', badge: 'Live', roles: ['admin', 'production_manager', 'quality_manager', 'warehouse_manager', 'executive'] },
  { id: 'production-orders', label: 'Production Orders', path: `${ERP_BASE_PATH}/production/orders`, iconName: 'Layers', category: 'Production', badge: 'Live', roles: ['admin', 'production_manager', 'quality_manager', 'warehouse_manager', 'executive'] },
  { id: 'production-boms', label: 'Bills of Materials (BOM)', path: `${ERP_BASE_PATH}/production/boms`, iconName: 'FolderTree', category: 'Production', badge: 'Live', roles: ['admin', 'production_manager', 'quality_manager', 'executive'] },
  { id: 'production-routings', label: 'Routings & Operations', path: `${ERP_BASE_PATH}/production/routings`, iconName: 'GitFork', category: 'Production', badge: 'Live', roles: ['admin', 'production_manager', 'quality_manager', 'executive'] },
  { id: 'production-dispatch', label: 'Shop Floor Dispatch', path: `${ERP_BASE_PATH}/production/operations-board`, iconName: 'Play', category: 'Production', badge: 'Live', roles: ['admin', 'production_manager', 'warehouse_manager'] },
  { id: 'production-costing', label: 'Costing Overview', path: `${ERP_BASE_PATH}/production/costing`, iconName: 'Coins', category: 'Production', badge: 'Live', roles: ['admin', 'production_manager', 'finance_manager', 'accountant', 'executive'] },
  { id: 'production-costing-orders', label: 'Production Costs', path: `${ERP_BASE_PATH}/production/costing/orders`, iconName: 'Calculator', category: 'Production', badge: 'Live', roles: ['admin', 'production_manager', 'finance_manager', 'accountant', 'executive'] },
  { id: 'production-wip', label: 'Work In Progress (WIP)', path: `${ERP_BASE_PATH}/production/wip`, iconName: 'Activity', category: 'Production', badge: 'Live', roles: ['admin', 'production_manager', 'finance_manager', 'accountant', 'executive'] },
  { id: 'production-variance', label: 'Cost Variance', path: `${ERP_BASE_PATH}/production/costing/variance`, iconName: 'TrendingDown', category: 'Production', badge: 'Live', roles: ['admin', 'production_manager', 'finance_manager', 'accountant', 'executive'] },
  { id: 'production-cost-config', label: 'Cost Configuration', path: `${ERP_BASE_PATH}/production/costing/configuration`, iconName: 'Settings', category: 'Production', badge: 'Live', roles: ['admin', 'production_manager', 'finance_manager', 'accountant', 'executive'] },
  { id: 'production-cost-reports', label: 'Cost Reports', path: `${ERP_BASE_PATH}/production/costing/reports`, iconName: 'FileText', category: 'Production', badge: 'Live', roles: ['admin', 'production_manager', 'finance_manager', 'accountant', 'executive'] },
  { id: 'production-planning-dashboard', label: 'Planning Overview', path: `${ERP_BASE_PATH}/production/planning`, iconName: 'CalendarRange', category: 'Production', badge: 'Live', roles: ['admin', 'production_manager', 'production_planner', 'quality_manager', 'warehouse_manager', 'executive'] },
  { id: 'production-planning-plans', label: 'Production Plans', path: `${ERP_BASE_PATH}/production/planning/plans`, iconName: 'ClipboardList', category: 'Production', badge: 'Live', roles: ['admin', 'production_manager', 'production_planner', 'executive'] },
  { id: 'production-planning-materials', label: 'Material Requirements', path: `${ERP_BASE_PATH}/production/planning/materials`, iconName: 'PackageCheck', category: 'Production', badge: 'Live', roles: ['admin', 'production_manager', 'production_planner', 'warehouse_manager', 'executive'] },
  { id: 'production-planning-capacity', label: 'Capacity Planning', path: `${ERP_BASE_PATH}/production/planning/capacity`, iconName: 'Gauge', category: 'Production', badge: 'Live', roles: ['admin', 'production_manager', 'production_planner', 'maintenance_manager', 'executive'] },
  { id: 'production-planning-schedule', label: 'Production Schedule', path: `${ERP_BASE_PATH}/production/planning/schedule`, iconName: 'Clock', category: 'Production', badge: 'Live', roles: ['admin', 'production_manager', 'production_planner', 'production_supervisor', 'executive'] },
  { id: 'production-planning-calendar', label: 'Production Calendar', path: `${ERP_BASE_PATH}/production/planning/calendar`, iconName: 'Calendar', category: 'Production', badge: 'Live', roles: ['admin', 'production_manager', 'production_planner', 'production_supervisor', 'executive'] },
  { id: 'production-planning-reports', label: 'Planning Reports', path: `${ERP_BASE_PATH}/production/planning/reports`, iconName: 'BarChart2', category: 'Production', badge: 'Live', roles: ['admin', 'production_manager', 'production_planner', 'executive'] },

  // Quality Management Section
  { id: 'quality-dashboard', label: 'Quality Overview', path: `${ERP_BASE_PATH}/quality`, iconName: 'ShieldCheck', category: 'Quality', badge: 'Live', roles: ['admin', 'quality_manager', 'production_manager', 'warehouse_manager', 'executive'] },
  { id: 'quality-inspections', label: 'Inspections', path: `${ERP_BASE_PATH}/quality/inspections`, iconName: 'ClipboardCheck', category: 'Quality', badge: 'Live', roles: ['admin', 'quality_manager', 'production_manager', 'warehouse_manager', 'executive'] },
  { id: 'quality-plans', label: 'Inspection Plans', path: `${ERP_BASE_PATH}/quality/inspection-plans`, iconName: 'FileSpreadsheet', category: 'Quality', badge: 'Live', roles: ['admin', 'quality_manager', 'production_manager', 'executive'] },
  { id: 'quality-defects', label: 'Defects Catalog', path: `${ERP_BASE_PATH}/quality/defects`, iconName: 'AlertCircle', category: 'Quality', badge: 'Live', roles: ['admin', 'quality_manager', 'production_manager', 'executive'] },
  { id: 'quality-ncr', label: 'Non-Conformance (NCR)', path: `${ERP_BASE_PATH}/quality/ncr`, iconName: 'AlertTriangle', category: 'Quality', badge: 'Live', roles: ['admin', 'quality_manager', 'production_manager', 'warehouse_manager', 'executive'] },
  { id: 'quality-capa', label: 'CAPA Management', path: `${ERP_BASE_PATH}/quality/capa`, iconName: 'CheckSquare', category: 'Quality', badge: 'Live', roles: ['admin', 'quality_manager', 'production_manager', 'executive'] },
  { id: 'quality-quarantine', label: 'Quarantine Control', path: `${ERP_BASE_PATH}/quality/quarantine`, iconName: 'Lock', category: 'Quality', badge: 'Live', roles: ['admin', 'quality_manager', 'warehouse_manager', 'executive'] },
  { id: 'quality-suppliers', label: 'Supplier Quality', path: `${ERP_BASE_PATH}/quality/suppliers`, iconName: 'Award', category: 'Quality', badge: 'Live', roles: ['admin', 'quality_manager', 'purchase_manager', 'executive'] },
  { id: 'quality-complaints', label: 'Customer Complaints', path: `${ERP_BASE_PATH}/quality/complaints`, iconName: 'MessageSquare', category: 'Quality', badge: 'Live', roles: ['admin', 'quality_manager', 'sales_manager', 'executive'] },
  { id: 'quality-reports', label: 'Quality Reports', path: `${ERP_BASE_PATH}/quality/reports`, iconName: 'BarChart2', category: 'Quality', badge: 'Live', roles: ['admin', 'quality_manager', 'production_manager', 'executive'] },

  // Maintenance & Asset Management Section
  { id: 'maintenance-dashboard', label: 'Maintenance Dashboard', path: `${ERP_BASE_PATH}/maintenance`, iconName: 'Wrench', category: 'Maintenance', badge: 'Live', roles: ['admin', 'maintenance_manager', 'maintenance_technician', 'production_manager', 'quality_manager', 'executive'] },
  { id: 'maintenance-requests', label: 'Requests', path: `${ERP_BASE_PATH}/maintenance/requests`, iconName: 'AlertTriangle', category: 'Maintenance', badge: 'Live', roles: ['admin', 'maintenance_manager', 'maintenance_technician', 'production_manager', 'executive'] },
  { id: 'maintenance-work-orders', label: 'Work Orders', path: `${ERP_BASE_PATH}/maintenance/work-orders`, iconName: 'ClipboardList', category: 'Maintenance', badge: 'Live', roles: ['admin', 'maintenance_manager', 'maintenance_technician', 'production_manager', 'executive'] },
  { id: 'maintenance-plans', label: 'Maintenance Plans', path: `${ERP_BASE_PATH}/maintenance/plans`, iconName: 'FileText', category: 'Maintenance', badge: 'Live', roles: ['admin', 'maintenance_manager', 'production_manager', 'executive'] },
  { id: 'maintenance-schedules', label: 'Schedule', path: `${ERP_BASE_PATH}/maintenance/schedule`, iconName: 'Clock', category: 'Maintenance', badge: 'Live', roles: ['admin', 'maintenance_manager', 'production_manager', 'executive'] },
  { id: 'maintenance-calendar', label: 'Calendar', path: `${ERP_BASE_PATH}/maintenance/calendar`, iconName: 'Calendar', category: 'Maintenance', badge: 'Live', roles: ['admin', 'maintenance_manager', 'production_manager', 'executive'] },
  { id: 'maintenance-breakdowns', label: 'Breakdowns', path: `${ERP_BASE_PATH}/maintenance/breakdowns`, iconName: 'ZapOff', category: 'Maintenance', badge: 'Live', roles: ['admin', 'maintenance_manager', 'maintenance_technician', 'production_manager', 'executive'] },
  { id: 'maintenance-downtime', label: 'Downtime', path: `${ERP_BASE_PATH}/maintenance/downtime`, iconName: 'Timer', category: 'Maintenance', badge: 'Live', roles: ['admin', 'maintenance_manager', 'production_manager', 'executive'] },
  { id: 'maintenance-history', label: 'Asset History', path: `${ERP_BASE_PATH}/maintenance/history`, iconName: 'ShieldCheck', category: 'Maintenance', badge: 'Live', roles: ['admin', 'maintenance_manager', 'production_manager', 'executive'] },
  { id: 'maintenance-reliability', label: 'Reliability (MTBF/MTTR)', path: `${ERP_BASE_PATH}/maintenance/reliability`, iconName: 'Activity', category: 'Maintenance', badge: 'Live', roles: ['admin', 'maintenance_manager', 'production_manager', 'executive'] },
  { id: 'maintenance-spare-parts', label: 'Spare Parts', path: `${ERP_BASE_PATH}/maintenance/spare-parts`, iconName: 'Package', category: 'Maintenance', badge: 'Live', roles: ['admin', 'maintenance_manager', 'warehouse_manager', 'executive'] },
  { id: 'maintenance-costs', label: 'Maintenance Costs', path: `${ERP_BASE_PATH}/maintenance/costs`, iconName: 'DollarSign', category: 'Maintenance', badge: 'Live', roles: ['admin', 'maintenance_manager', 'finance', 'executive'] },
  { id: 'maintenance-reports', label: 'Maintenance Reports', path: `${ERP_BASE_PATH}/maintenance/reports`, iconName: 'BarChart2', category: 'Maintenance', badge: 'Live', roles: ['admin', 'maintenance_manager', 'production_manager', 'executive'] },
  { id: 'maintenance-assets', label: 'Asset Master', path: `${ERP_BASE_PATH}/maintenance/assets`, iconName: 'Layers', category: 'Maintenance', badge: 'Live', roles: ['admin', 'maintenance_manager', 'maintenance_technician', 'production_manager', 'executive'] },

  // Machines & Capacity Section
  { id: 'work-centers', label: 'Work Centers', path: `${ERP_BASE_PATH}/production/work-centers`, iconName: 'Building2', category: 'Machines', badge: 'Live', roles: ['admin', 'production_manager'] },
  { id: 'cnc-machines', label: 'Machine Master', path: `${ERP_BASE_PATH}/production/machines`, iconName: 'Cpu', category: 'Machines', badge: 'Live', roles: ['admin', 'production_manager'] },

  // HR Operations Section
  { id: 'hr-dashboard', label: 'HR Operations', path: `${ERP_BASE_PATH}/hr`, iconName: 'Users', category: 'HR & Operations', badge: 'Live', roles: ['admin', 'hr'] },
  { id: 'hr-employees', label: 'Workforce Directory', path: `${ERP_BASE_PATH}/hr/employees`, iconName: 'UserCheck', category: 'HR & Operations', badge: 'Live', roles: ['admin', 'hr'] },
  { id: 'hr-departments', label: 'Departments & Units', path: `${ERP_BASE_PATH}/hr/departments`, iconName: 'Building2', category: 'HR & Operations', badge: 'Live', roles: ['admin', 'hr'] },
  { id: 'hr-organization', label: 'Org Hierarchy Tree', path: `${ERP_BASE_PATH}/hr/organization`, iconName: 'Network', category: 'HR & Operations', badge: 'Live', roles: ['admin', 'hr'] },
  { id: 'hr-reports', label: 'HR Analytics & Reports', path: `${ERP_BASE_PATH}/hr/reports`, iconName: 'BarChart2', category: 'HR & Operations', badge: 'Live', roles: ['admin', 'hr'] },
  { id: 'hr-attendance', label: 'Attendance Registry', path: `${ERP_BASE_PATH}/hr/attendance`, iconName: 'Clock', category: 'HR & Operations', badge: 'Live', roles: ['admin', 'hr'] },
  { id: 'hr-leave-requests', label: 'Leave Requests Queue', path: `${ERP_BASE_PATH}/hr/leave/requests`, iconName: 'CalendarRange', category: 'HR & Operations', badge: 'Live', roles: ['admin', 'hr'] },
  { id: 'hr-leave-balances', label: 'Leave Entitlements', path: `${ERP_BASE_PATH}/hr/leave`, iconName: 'Calendar', category: 'HR & Operations', badge: 'Live', roles: ['admin', 'hr'] },
  { id: 'hr-leave-types', label: 'Leave Policies', path: `${ERP_BASE_PATH}/hr/leave/types`, iconName: 'FileSpreadsheet', category: 'HR & Operations', badge: 'Live', roles: ['admin', 'hr'] },
  { id: 'hr-shifts', label: 'Shift Management', path: `${ERP_BASE_PATH}/hr/shifts`, iconName: 'Timer', category: 'HR & Operations', badge: 'Live', roles: ['admin', 'hr'] },
  { id: 'hr-holidays', label: 'Plant Holiday Calendar', path: `${ERP_BASE_PATH}/hr/holidays`, iconName: 'Calendar', category: 'HR & Operations', badge: 'Live', roles: ['admin', 'hr'] },

  // Finance & Accounting Section
  { id: 'finance-dashboard', label: 'Finance Dashboard', path: `${ERP_BASE_PATH}/finance`, iconName: 'DollarSign', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager'] },
  { id: 'finance-expenses', label: 'Expense Management', path: `${ERP_BASE_PATH}/finance/expenses`, iconName: 'Receipt', category: 'Finance & Accounting', badge: 'Live', roles: ALL_ROLES },
  { id: 'finance-expense-claims', label: 'Expense Claims', path: `${ERP_BASE_PATH}/finance/expenses/claims`, iconName: 'FileText', category: 'Finance & Accounting', badge: 'Live', roles: ALL_ROLES },
  { id: 'finance-expense-reimbursements', label: 'Reimbursements', path: `${ERP_BASE_PATH}/finance/expenses/reimbursements`, iconName: 'CreditCard', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager', 'executive'] },
  { id: 'finance-expense-reports', label: 'Expense Reports', path: `${ERP_BASE_PATH}/finance/expenses/reports`, iconName: 'BarChart2', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager', 'executive'] },
  { id: 'finance-expense-categories', label: 'Expense Categories', path: `${ERP_BASE_PATH}/finance/expenses/categories`, iconName: 'FolderTree', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant'] },
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
  { id: 'finance-assets', label: 'Fixed Assets Overview', path: `${ERP_BASE_PATH}/finance/assets`, iconName: 'Box', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager', 'executive'] },
  { id: 'finance-asset-register', label: 'Asset Register', path: `${ERP_BASE_PATH}/finance/assets/list`, iconName: 'FileSpreadsheet', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager', 'executive'] },
  { id: 'finance-asset-depreciation', label: 'Depreciation Runs', path: `${ERP_BASE_PATH}/finance/assets/depreciation`, iconName: 'TrendingDown', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager'] },
  { id: 'finance-asset-transfers', label: 'Asset Transfers', path: `${ERP_BASE_PATH}/finance/assets/transfers`, iconName: 'RefreshCw', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager'] },
  { id: 'finance-asset-disposals', label: 'Asset Disposals', path: `${ERP_BASE_PATH}/finance/assets/disposals`, iconName: 'Trash2', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager'] },
  { id: 'finance-asset-categories', label: 'Asset Categories', path: `${ERP_BASE_PATH}/finance/assets/categories`, iconName: 'FolderTree', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant'] },
  { id: 'finance-asset-reports', label: 'Asset Reports', path: `${ERP_BASE_PATH}/finance/assets/reports`, iconName: 'BarChart2', category: 'Finance & Accounting', badge: 'Live', roles: ['admin', 'finance', 'accountant', 'manager', 'executive'] },

  // Employee Self-Service Section
  { id: 'my-hr', label: 'Employee Portal (My HR)', path: `${ERP_BASE_PATH}/my-hr`, iconName: 'UserCheck', category: 'Self Service', badge: 'Live', roles: ALL_ROLES },
  { id: 'my-expenses', label: 'My Expense Claims', path: `${ERP_BASE_PATH}/finance/expenses/my`, iconName: 'Receipt', category: 'Self Service', badge: 'Live', roles: ALL_ROLES },
  { id: 'my-attendance', label: 'My Attendance Logs', path: `${ERP_BASE_PATH}/my-hr/attendance`, iconName: 'Clock', category: 'Self Service', badge: 'Live', roles: ALL_ROLES },
  { id: 'my-leave', label: 'My Leave Applications', path: `${ERP_BASE_PATH}/my-hr/leave`, iconName: 'Calendar', category: 'Self Service', badge: 'Live', roles: ALL_ROLES },

  // System & Management
  { id: 'employees', label: 'Employees & HR Master', path: `${ERP_BASE_PATH}/employees`, iconName: 'Users', category: 'Management', badge: 'Live', roles: ['admin', 'hr'] },
  { id: 'users', label: 'Employees & Access', path: `${ERP_BASE_PATH}/users`, iconName: 'UserCheck', category: 'Management', roles: ['admin'] },
  { id: 'reports', label: 'Reports', path: `${ERP_BASE_PATH}/reports`, iconName: 'BarChart3', category: 'Management', roles: ALL_ROLES },
  { id: 'settings', label: 'Settings', path: `${ERP_BASE_PATH}/settings`, iconName: 'Settings', category: 'Management', roles: ['admin'] },
];
