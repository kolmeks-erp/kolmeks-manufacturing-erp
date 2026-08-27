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
  { id: 'customers', label: 'Customers', path: `${ERP_BASE_PATH}/customers`, iconName: 'Users', category: 'Sales', badge: 'Live', roles: ['admin', 'sales_manager'] },

  // Procurement Section
  { id: 'suppliers', label: 'Suppliers', path: `${ERP_BASE_PATH}/suppliers`, iconName: 'Truck', category: 'Procurement', badge: 'Live', roles: ['admin', 'purchase_manager', 'warehouse_manager'] },
  { id: 'purchase-requisitions', label: 'Purchase Requisitions', path: `${ERP_BASE_PATH}/purchase-requisitions`, iconName: 'ClipboardList', category: 'Procurement', badge: 'Live', roles: ['admin', 'purchase_manager', 'warehouse_manager', 'executive'] },
  { id: 'purchase-orders', label: 'Purchase Orders', path: `${ERP_BASE_PATH}/purchase-orders`, iconName: 'Receipt', category: 'Procurement', badge: 'Live', roles: ['admin', 'purchase_manager', 'warehouse_manager', 'executive'] },
  { id: 'goods-receipts', label: 'Goods Receipts (GRN)', path: `${ERP_BASE_PATH}/goods-receipts`, iconName: 'PackageCheck', category: 'Procurement', badge: 'Live', roles: ['admin', 'purchase_manager', 'warehouse_manager', 'executive'] },

  // Products Section
  { id: 'products', label: 'Products Master', path: `${ERP_BASE_PATH}/products`, iconName: 'Package', category: 'Products', badge: 'Live', roles: ['admin', 'production_manager', 'sales_manager', 'quality_manager'] },
  { id: 'product-categories', label: 'Product Categories', path: `${ERP_BASE_PATH}/product-categories`, iconName: 'FolderTree', category: 'Products', badge: 'Live', roles: ['admin', 'production_manager', 'sales_manager', 'quality_manager'] },
  { id: 'materials', label: 'Raw Materials', path: `${ERP_BASE_PATH}/materials`, iconName: 'Boxes', category: 'Products', roles: ['admin', 'purchase_manager', 'production_manager'] },

  // Inventory Section
  { id: 'inventory', label: 'Inventory Balances', path: `${ERP_BASE_PATH}/inventory`, iconName: 'Boxes', category: 'Inventory', badge: 'Live', roles: ['admin', 'warehouse_manager', 'purchase_manager', 'production_manager', 'executive'] },
  { id: 'stock-movements', label: 'Stock Movements', path: `${ERP_BASE_PATH}/inventory/movements`, iconName: 'History', category: 'Inventory', badge: 'Live', roles: ['admin', 'warehouse_manager', 'purchase_manager', 'production_manager', 'executive'] },
  { id: 'warehouses', label: 'Warehouses & Bins', path: `${ERP_BASE_PATH}/warehouses`, iconName: 'Building2', category: 'Inventory', badge: 'Live', roles: ['admin', 'warehouse_manager', 'purchase_manager', 'production_manager', 'executive'] },

  // Production Section
  { id: 'production', label: 'Production Orders', path: `${ERP_BASE_PATH}/production`, iconName: 'Factory', category: 'Production', roles: ['admin', 'production_manager', 'quality_manager'] },

  // Quality Section
  { id: 'quality-control', label: 'Quality Inspections', path: `${ERP_BASE_PATH}/quality-control`, iconName: 'ShieldCheck', category: 'Quality', roles: ['admin', 'quality_manager'] },

  // Machines Section
  { id: 'cnc-machines', label: 'Machines Hub', path: `${ERP_BASE_PATH}/cnc-machines`, iconName: 'Cpu', category: 'Machines', roles: ['admin', 'production_manager'] },
  { id: 'maintenance', label: 'Maintenance', path: `${ERP_BASE_PATH}/maintenance`, iconName: 'Wrench', category: 'Machines', roles: ['admin', 'production_manager'] },

  // System & Management
  { id: 'employees', label: 'Employees & HR', path: `${ERP_BASE_PATH}/employees`, iconName: 'Users', category: 'Management', badge: 'Live', roles: ['admin', 'hr'] },
  { id: 'users', label: 'Employees & Access', path: `${ERP_BASE_PATH}/users`, iconName: 'UserCheck', category: 'Management', roles: ['admin'] },
  { id: 'reports', label: 'Reports', path: `${ERP_BASE_PATH}/reports`, iconName: 'BarChart3', category: 'Management', roles: ALL_ROLES },
  { id: 'settings', label: 'Settings', path: `${ERP_BASE_PATH}/settings`, iconName: 'Settings', category: 'Management', roles: ['admin'] },
];
