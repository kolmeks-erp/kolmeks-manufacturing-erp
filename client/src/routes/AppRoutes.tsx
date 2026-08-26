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
          <Route path="products" element={<ERPModuleShellPage />} />
          <Route path="materials" element={<ERPModuleShellPage />} />
          <Route path="customers" element={<ERPModuleShellPage />} />
          <Route path="suppliers" element={<ERPModuleShellPage />} />
          <Route path="rfqs" element={<ERPModuleShellPage />} />
          <Route path="quotations" element={<ERPModuleShellPage />} />
          <Route path="sales-orders" element={<ERPModuleShellPage />} />
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
