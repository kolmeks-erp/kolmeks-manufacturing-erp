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

import { PurchaseRequisitionListPage } from '../pages/erp/procurement/PurchaseRequisitionListPage';
import { PurchaseRequisitionFormPage } from '../pages/erp/procurement/PurchaseRequisitionFormPage';
import { PurchaseRequisitionDetailPage } from '../pages/erp/procurement/PurchaseRequisitionDetailPage';
import { PurchaseOrderListPage } from '../pages/erp/procurement/PurchaseOrderListPage';
import { PurchaseOrderFormPage } from '../pages/erp/procurement/PurchaseOrderFormPage';
import { PurchaseOrderDetailPage } from '../pages/erp/procurement/PurchaseOrderDetailPage';

import { GoodsReceiptListPage } from '../pages/erp/grn/GoodsReceiptListPage';
import { GoodsReceiptFormPage } from '../pages/erp/grn/GoodsReceiptFormPage';
import { GoodsReceiptDetailPage } from '../pages/erp/grn/GoodsReceiptDetailPage';

import { InventoryListPage } from '../pages/erp/inventory/InventoryListPage';
import { InventoryDetailPage } from '../pages/erp/inventory/InventoryDetailPage';
import { StockMovementListPage } from '../pages/erp/inventory/StockMovementListPage';
import { StockAdjustmentFormPage } from '../pages/erp/inventory/StockAdjustmentFormPage';
import { StockTransferFormPage } from '../pages/erp/inventory/StockTransferFormPage';
import { WarehouseListPage } from '../pages/erp/warehouses/WarehouseListPage';
import { WarehouseDetailPage } from '../pages/erp/warehouses/WarehouseDetailPage';

import { ProductionDashboardPage } from '../pages/erp/production/ProductionDashboardPage';
import { ProductionOrderListPage } from '../pages/erp/production/ProductionOrderListPage';
import { ProductionOrderFormPage } from '../pages/erp/production/ProductionOrderFormPage';
import { ProductionOrderDetailPage } from '../pages/erp/production/ProductionOrderDetailPage';
import { BOMListPage } from '../pages/erp/production/BOMListPage';
import { BOMFormPage } from '../pages/erp/production/BOMFormPage';
import { BOMDetailPage } from '../pages/erp/production/BOMDetailPage';
import { RoutingListPage } from '../pages/erp/production/RoutingListPage';
import { RoutingFormPage } from '../pages/erp/production/RoutingFormPage';
import { RoutingDetailPage } from '../pages/erp/production/RoutingDetailPage';
import { WorkCenterListPage } from '../pages/erp/production/WorkCenterListPage';
import { MachineListPage } from '../pages/erp/production/MachineListPage';
import { OperationBoardPage } from '../pages/erp/production/OperationBoardPage';

import QualityDashboardPage from '../pages/erp/quality/QualityDashboardPage';
import InspectionListPage from '../pages/erp/quality/InspectionListPage';
import InspectionFormPage from '../pages/erp/quality/InspectionFormPage';
import InspectionDetailPage from '../pages/erp/quality/InspectionDetailPage';
import InspectionPlanListPage from '../pages/erp/quality/InspectionPlanListPage';
import InspectionPlanFormPage from '../pages/erp/quality/InspectionPlanFormPage';
import InspectionPlanDetailPage from '../pages/erp/quality/InspectionPlanDetailPage';
import NCRListPage from '../pages/erp/quality/NCRListPage';
import NCRFormPage from '../pages/erp/quality/NCRFormPage';
import NCRDetailPage from '../pages/erp/quality/NCRDetailPage';
import QualityHoldListPage from '../pages/erp/quality/QualityHoldListPage';

import MaintenanceDashboardPage from '../pages/erp/maintenance/MaintenanceDashboardPage';
import AssetListPage from '../pages/erp/maintenance/AssetListPage';
import AssetFormPage from '../pages/erp/maintenance/AssetFormPage';
import AssetDetailPage from '../pages/erp/maintenance/AssetDetailPage';
import WorkOrderListPage from '../pages/erp/maintenance/WorkOrderListPage';
import WorkOrderFormPage from '../pages/erp/maintenance/WorkOrderFormPage';
import WorkOrderDetailPage from '../pages/erp/maintenance/WorkOrderDetailPage';
import MaintenanceScheduleListPage from '../pages/erp/maintenance/MaintenanceScheduleListPage';
import MaintenanceScheduleFormPage from '../pages/erp/maintenance/MaintenanceScheduleFormPage';
import MaintenanceRequestListPage from '../pages/erp/maintenance/MaintenanceRequestListPage';
import DowntimeListPage from '../pages/erp/maintenance/DowntimeListPage';
import MaintenanceHistoryPage from '../pages/erp/maintenance/MaintenanceHistoryPage';

import HRDashboardPage from '../pages/erp/hr/HRDashboardPage';
import HREmployeeListPage from '../pages/erp/hr/HREmployeeListPage';
import HRAttendanceListPage from '../pages/erp/hr/HRAttendanceListPage';
import HRLeaveListPage from '../pages/erp/hr/HRLeaveListPage';
import HRLeaveRequestListPage from '../pages/erp/hr/HRLeaveRequestListPage';
import HRLeaveTypeListPage from '../pages/erp/hr/HRLeaveTypeListPage';
import HRShiftListPage from '../pages/erp/hr/HRShiftListPage';
import HRHolidayListPage from '../pages/erp/hr/HRHolidayListPage';

import MyHRDashboardPage from '../pages/erp/hr/MyHRDashboardPage';
import MyAttendancePage from '../pages/erp/hr/MyAttendancePage';
import MyLeavePage from '../pages/erp/hr/MyLeavePage';

import FinanceDashboardPage from '../pages/erp/finance/FinanceDashboardPage';
import ChartOfAccountsPage from '../pages/erp/finance/ChartOfAccountsPage';
import AccountDetailPage from '../pages/erp/finance/AccountDetailPage';
import JournalEntryListPage from '../pages/erp/finance/JournalEntryListPage';
import JournalEntryFormPage from '../pages/erp/finance/JournalEntryFormPage';
import JournalEntryDetailPage from '../pages/erp/finance/JournalEntryDetailPage';
import FinancialPeriodListPage from '../pages/erp/finance/FinancialPeriodListPage';
import GeneralLedgerPage from '../pages/erp/finance/GeneralLedgerPage';
import TrialBalancePage from '../pages/erp/finance/TrialBalancePage';
import ProfitLossPage from '../pages/erp/finance/ProfitLossPage';
import BalanceSheetPage from '../pages/erp/finance/BalanceSheetPage';

import { InvoiceListPage } from '../pages/erp/sales-invoices/InvoiceListPage';
import { InvoiceFormPage } from '../pages/erp/sales-invoices/InvoiceFormPage';
import { InvoiceDetailPage } from '../pages/erp/sales-invoices/InvoiceDetailPage';
import { CustomerReceivablesPage } from '../pages/erp/finance/CustomerReceivablesPage';
import { PaymentListPage } from '../pages/erp/finance/PaymentListPage';
import { PaymentFormPage } from '../pages/erp/finance/PaymentFormPage';
import { PaymentDetailPage } from '../pages/erp/finance/PaymentDetailPage';
import { ReceivableAgingPage } from '../pages/erp/finance/ReceivableAgingPage';
import { CustomerStatementPage } from '../pages/erp/finance/CustomerStatementPage';

import { PurchaseInvoiceListPage } from '../pages/erp/purchase-invoices/PurchaseInvoiceListPage';
import { PurchaseInvoiceFormPage } from '../pages/erp/purchase-invoices/PurchaseInvoiceFormPage';
import { PurchaseInvoiceDetailPage } from '../pages/erp/purchase-invoices/PurchaseInvoiceDetailPage';
import { SupplierPayablesPage } from '../pages/erp/finance/SupplierPayablesPage';
import { SupplierPaymentListPage } from '../pages/erp/finance/SupplierPaymentListPage';
import { SupplierPaymentFormPage } from '../pages/erp/finance/SupplierPaymentFormPage';
import { SupplierPaymentDetailPage } from '../pages/erp/finance/SupplierPaymentDetailPage';
import { PayableAgingPage } from '../pages/erp/finance/PayableAgingPage';
import { SupplierStatementPage } from '../pages/erp/finance/SupplierStatementPage';

import { BudgetDashboardPage } from '../pages/erp/finance/BudgetDashboardPage';
import { BudgetListPage } from '../pages/erp/finance/BudgetListPage';
import { BudgetFormPage } from '../pages/erp/finance/BudgetFormPage';
import { BudgetDetailPage } from '../pages/erp/finance/BudgetDetailPage';
import { BudgetVariancePage } from '../pages/erp/finance/BudgetVariancePage';
import { BudgetApprovalsPage } from '../pages/erp/finance/BudgetApprovalsPage';
import { CostCenterListPage } from '../pages/erp/finance/CostCenterListPage';
import { CostCenterDetailPage } from '../pages/erp/finance/CostCenterDetailPage';

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
          <Route path="production" element={<ERPModuleShellPage />} />
          <Route path="cnc-machines" element={<ERPModuleShellPage />} />
          <Route path="inventory" element={<ERPModuleShellPage />} />
          <Route path="quality-control" element={<ERPModuleShellPage />} />
          <Route path="cmm" element={<ERPModuleShellPage />} />
          <Route path="maintenance" element={<ERPModuleShellPage />} />
          <Route path="deliveries" element={<ERPModuleShellPage />} />
          <Route path="reports" element={<ERPModuleShellPage />} />
          <Route path="notifications" element={<ERPModuleShellPage />} />

          {/* Purchase Requisitions Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'purchase_manager', 'warehouse_manager', 'executive']} />}>
            <Route path="purchase-requisitions" element={<PurchaseRequisitionListPage />} />
            <Route path="purchase-requisitions/new" element={<PurchaseRequisitionFormPage />} />
            <Route path="purchase-requisitions/:id" element={<PurchaseRequisitionDetailPage />} />
            <Route path="purchase-requisitions/:id/edit" element={<PurchaseRequisitionFormPage />} />
          </Route>

          {/* Purchase Orders Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'purchase_manager', 'warehouse_manager', 'executive']} />}>
            <Route path="purchase-orders" element={<PurchaseOrderListPage />} />
            <Route path="purchase-orders/new" element={<PurchaseOrderFormPage />} />
            <Route path="purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
            <Route path="purchase-orders/:id/edit" element={<PurchaseOrderFormPage />} />
          </Route>

          {/* Goods Receipts (GRN) Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'warehouse_manager', 'purchase_manager', 'quality_manager', 'executive']} />}>
            <Route path="goods-receipts" element={<GoodsReceiptListPage />} />
            <Route path="goods-receipts/new" element={<GoodsReceiptFormPage />} />
            <Route path="goods-receipts/:id" element={<GoodsReceiptDetailPage />} />
            <Route path="goods-receipts/:id/edit" element={<GoodsReceiptFormPage />} />
          </Route>

          {/* RFQs Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'sales_manager', 'production_manager', 'quality_manager']} />}>
            <Route path="rfqs" element={<RFQListPage />} />
            <Route path="rfqs/:id" element={<RFQDetailPage />} />
          </Route>

          {/* Inventory & Warehouse Management Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'warehouse_manager', 'purchase_manager', 'production_manager', 'executive']} />}>
            <Route path="inventory" element={<InventoryListPage />} />
            <Route path="inventory/movements" element={<StockMovementListPage />} />
            <Route path="inventory/adjustments/new" element={<StockAdjustmentFormPage />} />
            <Route path="inventory/transfers/new" element={<StockTransferFormPage />} />
            <Route path="inventory/:productId" element={<InventoryDetailPage />} />
            <Route path="warehouses" element={<WarehouseListPage />} />
            <Route path="warehouses/:id" element={<WarehouseDetailPage />} />
          </Route>

          {/* Production & Operations Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'production_manager', 'quality_manager', 'warehouse_manager', 'executive']} />}>
            <Route path="production" element={<ProductionDashboardPage />} />
            <Route path="production/orders" element={<ProductionOrderListPage />} />
            <Route path="production/orders/new" element={<ProductionOrderFormPage />} />
            <Route path="production/orders/:id" element={<ProductionOrderDetailPage />} />
            <Route path="production/boms" element={<BOMListPage />} />
            <Route path="production/boms/new" element={<BOMFormPage />} />
            <Route path="production/boms/:id" element={<BOMDetailPage />} />
            <Route path="production/routings" element={<RoutingListPage />} />
            <Route path="production/routings/new" element={<RoutingFormPage />} />
            <Route path="production/routings/:id" element={<RoutingDetailPage />} />
            <Route path="production/work-centers" element={<WorkCenterListPage />} />
            <Route path="production/machines" element={<MachineListPage />} />
            <Route path="production/operations-board" element={<OperationBoardPage />} />
          </Route>

          {/* Quality Management Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'quality_manager', 'quality_engineer', 'quality_inspector', 'production_manager', 'warehouse_manager', 'executive']} />}>
            <Route path="quality" element={<QualityDashboardPage />} />
            <Route path="quality/inspections" element={<InspectionListPage />} />
            <Route path="quality/inspections/new" element={<InspectionFormPage />} />
            <Route path="quality/inspections/:id" element={<InspectionDetailPage />} />
            <Route path="quality/inspection-plans" element={<InspectionPlanListPage />} />
            <Route path="quality/inspection-plans/new" element={<InspectionPlanFormPage />} />
            <Route path="quality/inspection-plans/:id" element={<InspectionPlanDetailPage />} />
            <Route path="quality/ncr" element={<NCRListPage />} />
            <Route path="quality/ncr/new" element={<NCRFormPage />} />
            <Route path="quality/ncr/:id" element={<NCRDetailPage />} />
            <Route path="quality/holds" element={<QualityHoldListPage />} />
          </Route>

          {/* Maintenance & Asset Management Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'maintenance_manager', 'maintenance_technician', 'production_manager', 'quality_manager', 'executive']} />}>
            <Route path="maintenance" element={<MaintenanceDashboardPage />} />
            <Route path="maintenance/assets" element={<AssetListPage />} />
            <Route path="maintenance/assets/new" element={<AssetFormPage />} />
            <Route path="maintenance/assets/:id" element={<AssetDetailPage />} />
            <Route path="maintenance/assets/:id/edit" element={<AssetFormPage />} />
            <Route path="maintenance/work-orders" element={<WorkOrderListPage />} />
            <Route path="maintenance/work-orders/new" element={<WorkOrderFormPage />} />
            <Route path="maintenance/work-orders/:id" element={<WorkOrderDetailPage />} />
            <Route path="maintenance/schedules" element={<MaintenanceScheduleListPage />} />
            <Route path="maintenance/schedules/new" element={<MaintenanceScheduleFormPage />} />
            <Route path="maintenance/requests" element={<MaintenanceRequestListPage />} />
            <Route path="maintenance/downtime" element={<DowntimeListPage />} />
            <Route path="maintenance/history" element={<MaintenanceHistoryPage />} />
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

          {/* HR & Operations Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'hr']} />}>
            <Route path="employees" element={<EmployeeListPage />} />
            <Route path="employees/new" element={<EmployeeCreatePage />} />
            <Route path="employees/:id" element={<EmployeeDetailPage />} />
            <Route path="employees/:id/edit" element={<EmployeeEditPage />} />

            <Route path="hr" element={<HRDashboardPage />} />
            <Route path="hr/employees" element={<HREmployeeListPage />} />
            <Route path="hr/attendance" element={<HRAttendanceListPage />} />
            <Route path="hr/leave" element={<HRLeaveListPage />} />
            <Route path="hr/leave/requests" element={<HRLeaveRequestListPage />} />
            <Route path="hr/leave/types" element={<HRLeaveTypeListPage />} />
            <Route path="hr/shifts" element={<HRShiftListPage />} />
            <Route path="hr/holidays" element={<HRHolidayListPage />} />
          </Route>

          {/* Employee Self-Service (My HR) Routes — Accessible to All Staff */}
          <Route path="my-hr" element={<MyHRDashboardPage />} />
          <Route path="my-hr/attendance" element={<MyAttendancePage />} />
          <Route path="my-hr/leave" element={<MyLeavePage />} />

          {/* Commercial Sales Invoices Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'sales_manager', 'finance', 'accountant', 'executive']} />}>
            <Route path="sales/invoices" element={<InvoiceListPage />} />
            <Route path="sales/invoices/new" element={<InvoiceFormPage />} />
            <Route path="sales/invoices/:id" element={<InvoiceDetailPage />} />
          </Route>

          {/* Procurement Purchase Invoices Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'purchase_manager', 'finance', 'accountant', 'executive']} />}>
            <Route path="purchases/invoices" element={<PurchaseInvoiceListPage />} />
            <Route path="purchases/invoices/new" element={<PurchaseInvoiceFormPage />} />
            <Route path="purchases/invoices/:id" element={<PurchaseInvoiceDetailPage />} />
          </Route>

          {/* Finance & Accounting Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'finance', 'accountant', 'manager']} />}>
            <Route path="finance" element={<FinanceDashboardPage />} />

            {/* Budgeting & Cost Management Routes */}
            <Route path="finance/budgets" element={<BudgetDashboardPage />} />
            <Route path="finance/budgets/list" element={<BudgetListPage />} />
            <Route path="finance/budgets/new" element={<BudgetFormPage />} />
            <Route path="finance/budgets/approvals" element={<BudgetApprovalsPage />} />
            <Route path="finance/budgets/:id" element={<BudgetDetailPage />} />
            <Route path="finance/budgets/:id/variance" element={<BudgetVariancePage />} />

            {/* Cost Center Routes */}
            <Route path="finance/cost-centers" element={<CostCenterListPage />} />
            <Route path="finance/cost-centers/:id" element={<CostCenterDetailPage />} />

            <Route path="finance/receivables" element={<CustomerReceivablesPage />} />
            <Route path="finance/receivables/aging" element={<ReceivableAgingPage />} />
            <Route path="finance/receivables/customer/:id" element={<CustomerStatementPage />} />
            <Route path="finance/receivables/customer/:id/statement" element={<CustomerStatementPage />} />
            <Route path="finance/customers/:id/statement" element={<CustomerStatementPage />} />
            <Route path="finance/payments" element={<PaymentListPage />} />
            <Route path="finance/payments/new" element={<PaymentFormPage />} />
            <Route path="finance/payments/:id" element={<PaymentDetailPage />} />

            {/* Accounts Payable & Supplier Payments */}
            <Route path="finance/payables" element={<SupplierPayablesPage />} />
            <Route path="finance/payables/aging" element={<PayableAgingPage />} />
            <Route path="finance/payables/supplier/:id" element={<SupplierStatementPage />} />
            <Route path="finance/payables/supplier/:id/statement" element={<SupplierStatementPage />} />
            <Route path="finance/suppliers/:id/statement" element={<SupplierStatementPage />} />
            <Route path="finance/supplier-payments" element={<SupplierPaymentListPage />} />
            <Route path="finance/supplier-payments/new" element={<SupplierPaymentFormPage />} />
            <Route path="finance/supplier-payments/:id" element={<SupplierPaymentDetailPage />} />

            <Route path="finance/accounts" element={<ChartOfAccountsPage />} />
            <Route path="finance/accounts/:id" element={<AccountDetailPage />} />
            <Route path="finance/journal-entries" element={<JournalEntryListPage />} />
            <Route path="finance/journal-entries/new" element={<JournalEntryFormPage />} />
            <Route path="finance/journal-entries/:id" element={<JournalEntryDetailPage />} />
            <Route path="finance/periods" element={<FinancialPeriodListPage />} />
            <Route path="finance/general-ledger" element={<GeneralLedgerPage />} />
            <Route path="finance/trial-balance" element={<TrialBalancePage />} />
            <Route path="finance/profit-loss" element={<ProfitLossPage />} />
            <Route path="finance/balance-sheet" element={<BalanceSheetPage />} />
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
