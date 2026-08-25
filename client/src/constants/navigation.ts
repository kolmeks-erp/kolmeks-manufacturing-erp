import { NavItem, ERPMenuItem } from '../types';

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

export const ERP_SIDEBAR_MENU: ERPMenuItem[] = [
  { id: 'dashboard', label: 'Executive Dashboard', path: `${ERP_BASE_PATH}/dashboard`, iconName: 'LayoutDashboard', category: 'core' },
  { id: 'products', label: 'Products Catalog', path: `${ERP_BASE_PATH}/products`, iconName: 'Package', category: 'core' },
  { id: 'materials', label: 'Materials Master', path: `${ERP_BASE_PATH}/materials`, iconName: 'Boxes', category: 'core' },
  { id: 'customers', label: 'Customers', path: `${ERP_BASE_PATH}/customers`, iconName: 'Users', category: 'core' },
  { id: 'suppliers', label: 'Suppliers', path: `${ERP_BASE_PATH}/suppliers`, iconName: 'Truck', category: 'core' },
  
  { id: 'rfqs', label: 'RFQs Management', path: `${ERP_BASE_PATH}/rfqs`, iconName: 'FileText', category: 'operations', badge: 'New' },
  { id: 'quotations', label: 'Quotations', path: `${ERP_BASE_PATH}/quotations`, iconName: 'FileSpreadsheet', category: 'operations' },
  { id: 'sales-orders', label: 'Sales Orders', path: `${ERP_BASE_PATH}/sales-orders`, iconName: 'ShoppingCart', category: 'operations' },
  { id: 'purchase-orders', label: 'Purchase Orders', path: `${ERP_BASE_PATH}/purchase-orders`, iconName: 'Receipt', category: 'operations' },
  { id: 'production', label: 'Production Scheduling', path: `${ERP_BASE_PATH}/production`, iconName: 'Factory', category: 'operations' },
  { id: 'cnc-machines', label: 'CNC Machine Hub', path: `${ERP_BASE_PATH}/cnc-machines`, iconName: 'Cpu', category: 'operations' },
  { id: 'inventory', label: 'Inventory Control', path: `${ERP_BASE_PATH}/inventory`, iconName: 'Warehouse', category: 'operations' },

  { id: 'quality-control', label: 'Quality Control (QC)', path: `${ERP_BASE_PATH}/quality-control`, iconName: 'ShieldCheck', category: 'quality' },
  { id: 'cmm', label: 'CMM Measurements', path: `${ERP_BASE_PATH}/cmm`, iconName: 'Ruler', category: 'quality' },
  { id: 'maintenance', label: 'Machine Maintenance', path: `${ERP_BASE_PATH}/maintenance`, iconName: 'Wrench', category: 'operations' },
  { id: 'deliveries', label: 'Logistics & Deliveries', path: `${ERP_BASE_PATH}/deliveries`, iconName: 'Navigation', category: 'operations' },

  { id: 'reports', label: 'Manufacturing Reports', path: `${ERP_BASE_PATH}/reports`, iconName: 'BarChart3', category: 'admin' },
  { id: 'users', label: 'User Roles & Access', path: `${ERP_BASE_PATH}/users`, iconName: 'UserCheck', category: 'admin' },
  { id: 'notifications', label: 'Notifications Hub', path: `${ERP_BASE_PATH}/notifications`, iconName: 'Bell', category: 'admin' },
  { id: 'settings', label: 'System Settings', path: `${ERP_BASE_PATH}/settings`, iconName: 'Settings', category: 'admin' },
];
