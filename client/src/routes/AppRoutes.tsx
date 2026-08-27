import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { ERPLayout } from '../layouts/ERPLayout';

import { HomePage } from '../pages/public/HomePage';
import { AboutPage } from '../pages/public/AboutPage';
import { ContractManufacturingPage } from '../pages/public/ContractManufacturingPage';
import { CncMachiningPage } from '../pages/public/CncMachiningPage';
import { AssemblyPage } from '../pages/public/AssemblyPage';
import { ElectricMotorsPage } from '../pages/public/ElectricMotorsPage';
import { SupplyChainPage } from '../pages/public/SupplyChainPage';
import { QualityPage } from '../pages/public/QualityPage';
import { LocationsPage } from '../pages/public/LocationsPage';
import { CareersPage } from '../pages/public/CareersPage';
import { NewsPage } from '../pages/public/NewsPage';
import { NewsDetailsPage } from '../pages/public/NewsDetailsPage';
import { ContactPage } from '../pages/public/ContactPage';
import { RequestQuotePage } from '../pages/public/RequestQuotePage';
import { PublicNotFoundPage } from '../pages/public/PublicNotFoundPage';

import { ERPLoginPage } from '../pages/erp/ERPLoginPage';
import { ERPDashboardPage } from '../pages/erp/ERPDashboardPage';
import { ERPModuleShellPage } from '../pages/erp/ERPModuleShellPage';
import { EmployeeListPage } from '../pages/erp/employees/EmployeeListPage';
import { EmployeeCreatePage } from '../pages/erp/employees/EmployeeCreatePage';
import { EmployeeDetailPage } from '../pages/erp/employees/EmployeeDetailPage';
import { EmployeeEditPage } from '../pages/erp/employees/EmployeeEditPage';
import { ProductListPage } from '../pages/erp/products/ProductListPage';
import { ProductCreatePage } from '../pages/erp/products/ProductCreatePage';
import { ProductDetailPage } from '../pages/erp/products/ProductDetailPage';
import { ProductEditPage } from '../pages/erp/products/ProductEditPage';
import { ProductCategoryListPage } from '../pages/erp/products/ProductCategoryListPage';
import { CustomerListPage } from '../pages/erp/customers/CustomerListPage';
import { CustomerCreatePage } from '../pages/erp/customers/CustomerCreatePage';
import { CustomerDetailPage } from '../pages/erp/customers/CustomerDetailPage';
import { CustomerEditPage } from '../pages/erp/customers/CustomerEditPage';
import { CustomerContactsPage } from '../pages/erp/customers/CustomerContactsPage';

import { SupplierListPage } from '../pages/erp/suppliers/SupplierListPage';
import { SupplierCreatePage } from '../pages/erp/suppliers/SupplierCreatePage';
import { SupplierDetailPage } from '../pages/erp/suppliers/SupplierDetailPage';
import { SupplierEditPage } from '../pages/erp/suppliers/SupplierEditPage';
import { SupplierContactsPage } from '../pages/erp/suppliers/SupplierContactsPage';

import { RFQListPage } from '../pages/erp/rfqs/RFQListPage';
import { RFQDetailPage } from '../pages/erp/rfqs/RFQDetailPage';
import { QuotationListPage } from '../pages/erp/quotations/QuotationListPage';
import { QuotationFormPage } from '../pages/erp/quotations/QuotationFormPage';
import { QuotationDetailPage } from '../pages/erp/quotations/QuotationDetailPage';
import { SalesOrderListPage } from '../pages/erp/sales-orders/SalesOrderListPage';
import { SalesOrderFormPage } from '../pages/erp/sales-orders/SalesOrderFormPage';
import { SalesOrderDetailPage } from '../pages/erp/sales-orders/SalesOrderDetailPage';

import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { ERP_BASE_PATH } from '../constants/navigation';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Corporate Website Routes (Unprotected) */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contract-manufacturing" element={<ContractManufacturingPage />} />
        <Route path="cnc-machining" element={<CncMachiningPage />} />
        <Route path="assembly" element={<AssemblyPage />} />
        <Route path="electric-motors" element={<ElectricMotorsPage />} />
        <Route path="supply-chain" element={<SupplyChainPage />} />
        <Route path="quality" element={<QualityPage />} />
        <Route path="locations" element={<LocationsPage />} />
        <Route path="careers" element={<CareersPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="news/:slug" element={<NewsDetailsPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="request-quote" element={<RequestQuotePage />} />
        <Route path="404" element={<PublicNotFoundPage />} />
      </Route>

      {/* Secure ERP Standalone Login Route */}
      <Route path={`${ERP_BASE_PATH}/login`} element={<ERPLoginPage />} />

      {/* Protected Internal ERP Portal Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path={ERP_BASE_PATH} element={<ERPLayout />}>
          <Route index element={<Navigate to={`${ERP_BASE_PATH}/dashboard`} replace />} />
          <Route path="dashboard" element={<ERPDashboardPage />} />
          <Route path="materials" element={<ERPModuleShellPage />} />
          <Route path="purchase-orders" element={<ERPModuleShellPage />} />
          <Route path="production" element={<ERPModuleShellPage />} />
          <Route path="cnc-machines" element={<ERPModuleShellPage />} />
          <Route path="inventory" element={<ERPModuleShellPage />} />
          <Route path="quality-control" element={<ERPModuleShellPage />} />
          <Route path="cmm" element={<ERPModuleShellPage />} />
          <Route path="maintenance" element={<ERPModuleShellPage />} />
          <Route path="deliveries" element={<ERPModuleShellPage />} />
          <Route path="reports" element={<ERPModuleShellPage />} />
          <Route path="notifications" element={<ERPModuleShellPage />} />

          {/* RFQs Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'sales_manager', 'production_manager', 'quality_manager']} />}>
            <Route path="rfqs" element={<RFQListPage />} />
            <Route path="rfqs/:id" element={<RFQDetailPage />} />
          </Route>

          {/* Commercial Quotations Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'sales_manager']} />}>
            <Route path="quotations" element={<QuotationListPage />} />
            <Route path="quotations/new" element={<QuotationFormPage />} />
            <Route path="quotations/:id" element={<QuotationDetailPage />} />
            <Route path="quotations/:id/edit" element={<QuotationFormPage />} />
          </Route>

          {/* Sales Orders Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'sales_manager', 'executive']} />}>
            <Route path="sales-orders" element={<SalesOrderListPage />} />
            <Route path="sales-orders/new" element={<SalesOrderFormPage />} />
            <Route path="sales-orders/:id" element={<SalesOrderDetailPage />} />
            <Route path="sales-orders/:id/edit" element={<SalesOrderFormPage />} />
          </Route>

          {/* Suppliers & Contacts Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'purchase_manager', 'warehouse_manager']} />}>
            <Route path="suppliers" element={<SupplierListPage />} />
            <Route path="suppliers/new" element={<SupplierCreatePage />} />
            <Route path="suppliers/:id" element={<SupplierDetailPage />} />
            <Route path="suppliers/:id/edit" element={<SupplierEditPage />} />
            <Route path="suppliers/:id/contacts" element={<SupplierContactsPage />} />
          </Route>

          {/* Customers & Contacts Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'sales_manager']} />}>
            <Route path="customers" element={<CustomerListPage />} />
            <Route path="customers/new" element={<CustomerCreatePage />} />
            <Route path="customers/:id" element={<CustomerDetailPage />} />
            <Route path="customers/:id/edit" element={<CustomerEditPage />} />
            <Route path="customers/:id/contacts" element={<CustomerContactsPage />} />
          </Route>

          {/* Products & Categories Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'production_manager', 'sales_manager', 'quality_manager']} />}>
            <Route path="products" element={<ProductListPage />} />
            <Route path="products/new" element={<ProductCreatePage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="products/:id/edit" element={<ProductEditPage />} />
            <Route path="product-categories" element={<ProductCategoryListPage />} />
          </Route>

          {/* HR & Admin Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'hr']} />}>
            <Route path="employees" element={<EmployeeListPage />} />
            <Route path="employees/new" element={<EmployeeCreatePage />} />
            <Route path="employees/:id" element={<EmployeeDetailPage />} />
            <Route path="employees/:id/edit" element={<EmployeeEditPage />} />
          </Route>

          {/* Admin Restricted Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="users" element={<ERPModuleShellPage />} />
            <Route path="settings" element={<ERPModuleShellPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback Catch-all Route to Public 404 */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};
