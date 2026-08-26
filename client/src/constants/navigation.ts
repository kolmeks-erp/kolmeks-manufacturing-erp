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
  'sales_manager',
  'purchase_manager',
  'production_manager',
  'quality_manager',
  'warehouse_manager',
];

export const ERP_SIDEBAR_MENU: ERPMenuItem[] = [
  { id: 'dashboard', label: 'Executive Dashboard', path: `${ERP_BASE_PATH}/dashboard`, iconName: 'LayoutDashboard', category: 'core', roles: ALL_ROLES },
  { id: 'products', label: 'Products Catalog', path: `${ERP_BASE_PATH}/products`, iconName: 'Package', category: 'core', roles: ['admin', 'production_manager', 'sales_manager', 'quality_manager'] },
  { id: 'materials', label: 'Materials Master', path: `${ERP_BASE_PATH}/materials`, iconName: 'Boxes', category: 'core', roles: ['admin', 'purchase_manager', 'production_manager'] },
  { id: 'customers', label: 'Customers', path: `${ERP_BASE_PATH}/customers`, iconName: 'Users', category: 'core', roles: ['admin', 'sales_manager'] },
  { id: 'suppliers', label: 'Suppliers', path: `${ERP_BASE_PATH}/suppliers`, iconName: 'Truck', category: 'core', roles: ['admin', 'purchase_manager', 'warehouse_manager'] },
  
  { id: 'rfqs', label: 'RFQs Management', path: `${ERP_BASE_PATH}/rfqs`, iconName: 'FileText', category: 'operations', badge: 'New', roles: ['admin', 'sales_manager'] },
  { id: 'quotations', label: 'Quotations', path: `${ERP_BASE_PATH}/quotations`, iconName: 'FileSpreadsheet', category: 'operations', roles: ['admin', 'sales_manager'] },
  { id: 'sales-orders', label: 'Sales Orders', path: `${ERP_BASE_PATH}/sales-orders`, iconName: 'ShoppingCart', category: 'operations', roles: ['admin', 'sales_manager'] },
  { id: 'purchase-orders', label: 'Purchase Orders', path: `${ERP_BASE_PATH}/purchase-orders`, iconName: 'Receipt', category: 'operations', roles: ['admin', 'purchase_manager', 'warehouse_manager'] },
  { id: 'production', label: 'Production Scheduling', path: `${ERP_BASE_PATH}/production`, iconName: 'Factory', category: 'operations', roles: ['admin', 'production_manager', 'quality_manager'] },
  { id: 'cnc-machines', label: 'CNC Machine Hub', path: `${ERP_BASE_PATH}/cnc-machines`, iconName: 'Cpu', category: 'operations', roles: ['admin', 'production_manager'] },
  { id: 'inventory', label: 'Inventory Control', path: `${ERP_BASE_PATH}/inventory`, iconName: 'Warehouse', category: 'operations', roles: ['admin', 'warehouse_manager', 'purchase_manager', 'production_manager'] },

  { id: 'quality-control', label: 'Quality Control (QC)', path: `${ERP_BASE_PATH}/quality-control`, iconName: 'ShieldCheck', category: 'quality', roles: ['admin', 'quality_manager'] },
  { id: 'cmm', label: 'CMM Measurements', path: `${ERP_BASE_PATH}/cmm`, iconName: 'Ruler', category: 'quality', roles: ['admin', 'quality_manager'] },
  { id: 'maintenance', label: 'Machine Maintenance', path: `${ERP_BASE_PATH}/maintenance`, iconName: 'Wrench', category: 'operations', roles: ['admin', 'production_manager'] },
  { id: 'deliveries', label: 'Logistics & Deliveries', path: `${ERP_BASE_PATH}/deliveries`, iconName: 'Navigation', category: 'operations', roles: ['admin', 'warehouse_manager', 'sales_manager'] },

  { id: 'reports', label: 'Manufacturing Reports', path: `${ERP_BASE_PATH}/reports`, iconName: 'BarChart3', category: 'admin', roles: ALL_ROLES },
  { id: 'users', label: 'User Roles & Access', path: `${ERP_BASE_PATH}/users`, iconName: 'UserCheck', category: 'admin', roles: ['admin'] },
  { id: 'notifications', label: 'Notifications Hub', path: `${ERP_BASE_PATH}/notifications`, iconName: 'Bell', category: 'admin', roles: ALL_ROLES },
  { id: 'settings', label: 'System Settings', path: `${ERP_BASE_PATH}/settings`, iconName: 'Settings', category: 'admin', roles: ['admin'] },
];
