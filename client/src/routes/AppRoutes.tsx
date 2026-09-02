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

import { SalesDashboardPage } from '../pages/erp/sales/SalesDashboardPage';
import { AdvancedQuotationListPage } from '../pages/erp/sales/AdvancedQuotationListPage';
import { AdvancedQuotationDetailPage } from '../pages/erp/sales/AdvancedQuotationDetailPage';
import { OrderFulfillmentPage } from '../pages/erp/sales/OrderFulfillmentPage';
import { PickingListPage } from '../pages/erp/sales/PickingListPage';
import { PackingListPage } from '../pages/erp/sales/PackingListPage';
import { DeliveryListPage } from '../pages/erp/sales/DeliveryListPage';
import { DeliveryDetailPage } from '../pages/erp/sales/DeliveryDetailPage';
import { SalesReturnListPage } from '../pages/erp/sales/SalesReturnListPage';
import { CreditNotesListPage } from '../pages/erp/sales/CreditNotesListPage';
import { PricingManagementPage } from '../pages/erp/sales/PricingManagementPage';
import { SalesReportsPage } from '../pages/erp/sales/SalesReportsPage';

import { PurchaseRequisitionListPage } from '../pages/erp/procurement/PurchaseRequisitionListPage';
import { PurchaseRequisitionFormPage } from '../pages/erp/procurement/PurchaseRequisitionFormPage';
import { PurchaseRequisitionDetailPage } from '../pages/erp/procurement/PurchaseRequisitionDetailPage';

import { ProcurementDashboardPage } from '../pages/erp/procurement/ProcurementDashboardPage';
import { QuotationComparisonPage } from '../pages/erp/procurement/QuotationComparisonPage';
import { SupplierReturnsPage } from '../pages/erp/procurement/SupplierReturnsPage';
import { ThreeWayMatchPage } from '../pages/erp/procurement/ThreeWayMatchPage';
import { ProcurementReportsPage } from '../pages/erp/procurement/ProcurementReportsPage';

import { DocumentDashboardPage } from '../pages/erp/documents/DocumentDashboardPage';
import { DocumentLibraryPage } from '../pages/erp/documents/DocumentLibraryPage';
import { DocumentDetailPage } from '../pages/erp/documents/DocumentDetailPage';
import { DocumentApprovalsPage } from '../pages/erp/documents/DocumentApprovalsPage';
import { RecentDocumentsPage } from '../pages/erp/documents/RecentDocumentsPage';
import { ExpiringDocumentsPage } from '../pages/erp/documents/ExpiringDocumentsPage';
import { DocumentTypesPage } from '../pages/erp/documents/DocumentTypesPage';
import { DocumentCategoriesPage } from '../pages/erp/documents/DocumentCategoriesPage';
import { DocumentReportsPage } from '../pages/erp/documents/DocumentReportsPage';
import { NotificationDashboardPage } from '../pages/erp/notifications/NotificationDashboardPage';
import { NotificationSettingsPage } from '../pages/erp/notifications/NotificationSettingsPage';
import { NotificationReportsPage } from '../pages/erp/notifications/NotificationReportsPage';
import { WorkflowDashboardPage } from '../pages/erp/workflows/WorkflowDashboardPage';
import { WorkflowDefinitionsPage } from '../pages/erp/workflows/WorkflowDefinitionsPage';
import { WorkflowBuilderPage } from '../pages/erp/workflows/WorkflowBuilderPage';
import { WorkflowInstancesPage } from '../pages/erp/workflows/WorkflowInstancesPage';
import { WorkflowTasksPage } from '../pages/erp/workflows/WorkflowTasksPage';
import { WorkflowHistoryPage } from '../pages/erp/workflows/WorkflowHistoryPage';
import { WorkflowReportsPage } from '../pages/erp/workflows/WorkflowReportsPage';
import { WorkflowSettingsPage } from '../pages/erp/workflows/WorkflowSettingsPage';
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

// Advanced Inventory System Modules
import { InventoryDashboardPage } from '../pages/erp/inventory/InventoryDashboardPage';
import { StockOverviewPage } from '../pages/erp/inventory/StockOverviewPage';
import { WarehouseListPage as AdvancedWarehouseListPage } from '../pages/erp/inventory/WarehouseListPage';
import { StockMovementsPage } from '../pages/erp/inventory/StockMovementsPage';
import { StockTransfersPage } from '../pages/erp/inventory/StockTransfersPage';
import { StockAdjustmentsPage } from '../pages/erp/inventory/StockAdjustmentsPage';
import { StockReservationsPage } from '../pages/erp/inventory/StockReservationsPage';
import { StockBatchesPage } from '../pages/erp/inventory/StockBatchesPage';
import { StockSerialsPage } from '../pages/erp/inventory/StockSerialsPage';
import { ReorderDashboardPage } from '../pages/erp/inventory/ReorderDashboardPage';
import { InventoryReportsPage } from '../pages/erp/inventory/InventoryReportsPage';

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
import DefectsListPage from '../pages/erp/quality/DefectsListPage';
import CAPAListPage from '../pages/erp/quality/CAPAListPage';
import CAPAFormPage from '../pages/erp/quality/CAPAFormPage';
import CAPADetailPage from '../pages/erp/quality/CAPADetailPage';
import QuarantineListPage from '../pages/erp/quality/QuarantineListPage';
import SupplierQualityPage from '../pages/erp/quality/SupplierQualityPage';
import CustomerComplaintsListPage from '../pages/erp/quality/CustomerComplaintsListPage';
import CustomerComplaintFormPage from '../pages/erp/quality/CustomerComplaintFormPage';
import QualityReportsPage from '../pages/erp/quality/QualityReportsPage';

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
import BreakdownListPage from '../pages/erp/maintenance/BreakdownListPage';
import ReliabilityDashboardPage from '../pages/erp/maintenance/ReliabilityDashboardPage';
import MaintenanceCostsPage from '../pages/erp/maintenance/MaintenanceCostsPage';
import MaintenanceCalendarPage from '../pages/erp/maintenance/MaintenanceCalendarPage';
import MaintenanceReportsPage from '../pages/erp/maintenance/MaintenanceReportsPage';
import SparePartsPage from '../pages/erp/maintenance/SparePartsPage';

import { DepartmentsPage } from '../pages/erp/employees/DepartmentsPage';
import { OrganizationStructurePage } from '../pages/erp/employees/OrganizationStructurePage';

import HRDashboardPage from '../pages/erp/hr/HRDashboardPage';
import HREmployeeListPage from '../pages/erp/hr/HREmployeeListPage';
import HRAttendanceListPage from '../pages/erp/hr/HRAttendanceListPage';
import HRLeaveListPage from '../pages/erp/hr/HRLeaveListPage';
import HRLeaveRequestListPage from '../pages/erp/hr/HRLeaveRequestListPage';
import HRLeaveTypeListPage from '../pages/erp/hr/HRLeaveTypeListPage';
import HRShiftListPage from '../pages/erp/hr/HRShiftListPage';
import HRHolidayListPage from '../pages/erp/hr/HRHolidayListPage';
import { HRReportsPage } from '../pages/erp/hr/HRReportsPage';

import MyHRDashboardPage from '../pages/erp/hr/MyHRDashboardPage';
import MyAttendancePage from '../pages/erp/hr/MyAttendancePage';
import MyLeavePage from '../pages/erp/hr/MyLeavePage';
import { OvertimePage } from '../pages/erp/hr/OvertimePage';
import { WorkingCalendarPage } from '../pages/erp/hr/WorkingCalendarPage';

import { PayrollDashboardPage } from '../pages/erp/payroll/PayrollDashboardPage';
import { PayrollPeriodsPage } from '../pages/erp/payroll/PayrollPeriodsPage';
import { PayrollRunsPage } from '../pages/erp/payroll/PayrollRunsPage';
import { PayrollRunDetailPage } from '../pages/erp/payroll/PayrollRunDetailPage';
import { PayslipsPage } from '../pages/erp/payroll/PayslipsPage';
import { PayrollReportsPage } from '../pages/erp/payroll/PayrollReportsPage';
import { CompensationManagementPage } from '../pages/erp/payroll/CompensationManagementPage';

import { CRMDashboardPage } from '../pages/erp/crm/CRMDashboardPage';
import { LeadsListPage } from '../pages/erp/crm/LeadsListPage';
import { LeadDetailPage } from '../pages/erp/crm/LeadDetailPage';
import { OpportunitiesListPage } from '../pages/erp/crm/OpportunitiesListPage';
import { OpportunityDetailPage } from '../pages/erp/crm/OpportunityDetailPage';
import { PipelineBoardPage } from '../pages/erp/crm/PipelineBoardPage';
import { ActivitiesListPage } from '../pages/erp/crm/ActivitiesListPage';
import { TasksListPage } from '../pages/erp/crm/TasksListPage';
import { FollowupsListPage } from '../pages/erp/crm/FollowupsListPage';
import { CustomerTimelinePage } from '../pages/erp/crm/CustomerTimelinePage';
import { CRMReportsPage } from '../pages/erp/crm/CRMReportsPage';

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

import { ExpenseDashboardPage } from '../pages/erp/finance/expenses/ExpenseDashboardPage';
import { ExpenseClaimListPage } from '../pages/erp/finance/expenses/ExpenseClaimListPage';
import { MyExpensesPage } from '../pages/erp/finance/expenses/MyExpensesPage';
import { ExpenseClaimFormPage } from '../pages/erp/finance/expenses/ExpenseClaimFormPage';
import { ExpenseClaimDetailPage } from '../pages/erp/finance/expenses/ExpenseClaimDetailPage';
import { ExpenseCategoryListPage } from '../pages/erp/finance/expenses/ExpenseCategoryListPage';
import { ReimbursementListPage } from '../pages/erp/finance/expenses/ReimbursementListPage';
import { ExpenseReportsPage } from '../pages/erp/finance/expenses/ExpenseReportsPage';

import { AssetDashboardPage as FixedAssetDashboardPage } from '../pages/erp/finance/assets/AssetDashboardPage';
import { AssetListPage as FixedAssetListPage } from '../pages/erp/finance/assets/AssetListPage';
import { AssetFormPage as FixedAssetFormPage } from '../pages/erp/finance/assets/AssetFormPage';
import { AssetDetailPage as FixedAssetDetailPage } from '../pages/erp/finance/assets/AssetDetailPage';
import { DepreciationManagementPage } from '../pages/erp/finance/assets/DepreciationManagementPage';
import { AssetTransferListPage } from '../pages/erp/finance/assets/AssetTransferListPage';
import { AssetDisposalListPage } from '../pages/erp/finance/assets/AssetDisposalListPage';
import { AssetCategoryListPage as FixedAssetCategoryListPage } from '../pages/erp/finance/assets/AssetCategoryListPage';
import { AssetReportsPage as FixedAssetReportsPage } from '../pages/erp/finance/assets/AssetReportsPage';

import { ManufacturingCostDashboardPage } from '../pages/erp/production/costing/ManufacturingCostDashboardPage';
import { ProductionCostListPage } from '../pages/erp/production/costing/ProductionCostListPage';
import { ProductionCostDetailPage } from '../pages/erp/production/costing/ProductionCostDetailPage';
import { WIPDashboardPage } from '../pages/erp/production/costing/WIPDashboardPage';
import { WIPDetailPage } from '../pages/erp/production/costing/WIPDetailPage';
import { ManufacturingVariancePage } from '../pages/erp/production/costing/ManufacturingVariancePage';
import { CostConfigurationPage } from '../pages/erp/production/costing/CostConfigurationPage';
import { CostReportsPage } from '../pages/erp/production/costing/CostReportsPage';

import ProductionPlanningDashboardPage from '../pages/erp/production/planning/ProductionPlanningDashboardPage';
import ProductionPlanListPage from '../pages/erp/production/planning/ProductionPlanListPage';
import ProductionPlanFormPage from '../pages/erp/production/planning/ProductionPlanFormPage';
import ProductionPlanDetailPage from '../pages/erp/production/planning/ProductionPlanDetailPage';
import MaterialRequirementsPage from '../pages/erp/production/planning/MaterialRequirementsPage';
import CapacityPlanningPage from '../pages/erp/production/planning/CapacityPlanningPage';
import ProductionSchedulePage from '../pages/erp/production/planning/ProductionSchedulePage';
import ProductionCalendarPage from '../pages/erp/production/planning/ProductionCalendarPage';
import PlanningReportsPage from '../pages/erp/production/planning/PlanningReportsPage';

import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { ERP_BASE_PATH } from '../constants/navigation';
import { SystemSettingsProvider, useSystemSettings } from '../context/SystemSettingsContext';
import { MasterAdminControlPage } from '../pages/erp/admin/MasterAdminControlPage';

// System Administration & Settings Pages
import { SettingsDashboardPage } from '../pages/erp/settings/SettingsDashboardPage';
import { GeneralSettingsPage } from '../pages/erp/settings/GeneralSettingsPage';
import { OrganizationSettingsPage } from '../pages/erp/settings/OrganizationSettingsPage';
import { LocationSettingsPage } from '../pages/erp/settings/LocationSettingsPage';
import { DepartmentSettingsPage } from '../pages/erp/settings/DepartmentSettingsPage';
import { UserSettingsPage } from '../pages/erp/settings/UserSettingsPage';
import { RoleSettingsPage } from '../pages/erp/settings/RoleSettingsPage';
import { PermissionSettingsPage } from '../pages/erp/settings/PermissionSettingsPage';
import { NumberingSettingsPage } from '../pages/erp/settings/NumberingSettingsPage';
import { CurrencySettingsPage } from '../pages/erp/settings/CurrencySettingsPage';
import { UnitSettingsPage } from '../pages/erp/settings/UnitSettingsPage';
import { StatusSettingsPage } from '../pages/erp/settings/StatusSettingsPage';
import { MasterSettingsPage } from '../pages/erp/settings/MasterSettingsPage';
import { SecuritySettingsPage } from '../pages/erp/settings/SecuritySettingsPage';
import { AuditSettingsPage } from '../pages/erp/settings/AuditSettingsPage';

// Advanced Reporting & Analytics Pages
import { ReportsExecutiveDashboardPage } from '../pages/erp/reports/ReportsExecutiveDashboardPage';
import { SalesReportPage } from '../pages/erp/reports/SalesReportPage';
import { ProcurementReportPage } from '../pages/erp/reports/ProcurementReportPage';
import { InventoryReportPage } from '../pages/erp/reports/InventoryReportPage';
import { ProductionReportPage } from '../pages/erp/reports/ProductionReportPage';
import { QualityReportPage } from '../pages/erp/reports/QualityReportPage';
import { MaintenanceReportPage } from '../pages/erp/reports/MaintenanceReportPage';
import { HRReportPage } from '../pages/erp/reports/HRReportPage';
import { FinanceReportPage } from '../pages/erp/reports/FinanceReportPage';
import { CRMReportPage } from '../pages/erp/reports/CRMReportPage';
import { DocumentReportPage } from '../pages/erp/reports/DocumentReportPage';
import { WorkflowReportPage } from '../pages/erp/reports/WorkflowReportPage';
import { AuditReportPage } from '../pages/erp/reports/AuditReportPage';
import { CustomSavedReportsPage } from '../pages/erp/reports/CustomSavedReportsPage';

// Security & Compliance Hardening Pages
import { SecurityOverviewPage } from '../pages/erp/security/SecurityOverviewPage';
import { AccessControlSecurityPage } from '../pages/erp/security/AccessControlSecurityPage';
import { SessionSecurityPage } from '../pages/erp/security/SessionSecurityPage';
import { SecurityEventsPage } from '../pages/erp/security/SecurityEventsPage';
import { SecurityPoliciesPage } from '../pages/erp/security/SecurityPoliciesPage';
import { SecurityAuditPage } from '../pages/erp/security/SecurityAuditPage';
import { SecurityReportsPage } from '../pages/erp/security/SecurityReportsPage';

// Global Search & Activity Center Pages
import { SearchResultsPage } from '../pages/erp/search/SearchResultsPage';
import { MyActivityPage } from '../pages/erp/activity/MyActivityPage';
import { TeamActivityPage } from '../pages/erp/activity/TeamActivityPage';
import { SystemActivityPage } from '../pages/erp/activity/SystemActivityPage';

export const AppRoutes: React.FC = () => {
  return (
    <SystemSettingsProvider>
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

          {/* Advanced Inventory & Stock Control Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'warehouse_manager', 'inventory_manager', 'purchase_manager', 'production_manager', 'quality_manager', 'sales_manager', 'finance_manager', 'executive']} />}>
            <Route path="inventory" element={<InventoryDashboardPage />} />
            <Route path="inventory/stock" element={<StockOverviewPage />} />
            <Route path="inventory/warehouses" element={<AdvancedWarehouseListPage />} />
            <Route path="inventory/movements" element={<StockMovementsPage />} />
            <Route path="inventory/transfers" element={<StockTransfersPage />} />
            <Route path="inventory/transfers/new" element={<StockTransferFormPage />} />
            <Route path="inventory/adjustments" element={<StockAdjustmentsPage />} />
            <Route path="inventory/adjustments/new" element={<StockAdjustmentFormPage />} />
            <Route path="inventory/reservations" element={<StockReservationsPage />} />
            <Route path="inventory/batches" element={<StockBatchesPage />} />
            <Route path="inventory/serial-numbers" element={<StockSerialsPage />} />
            <Route path="inventory/reorder" element={<ReorderDashboardPage />} />
            <Route path="inventory/reports" element={<InventoryReportsPage />} />
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
            <Route path="production/costing" element={<ManufacturingCostDashboardPage />} />
            <Route path="production/costing/orders" element={<ProductionCostListPage />} />
            <Route path="production/costing/orders/:id" element={<ProductionCostDetailPage />} />
            <Route path="production/wip" element={<WIPDashboardPage />} />
            <Route path="production/wip/:id" element={<WIPDetailPage />} />
            <Route path="production/costing/variance" element={<ManufacturingVariancePage />} />
            <Route path="production/costing/configuration" element={<CostConfigurationPage />} />
            <Route path="production/costing/reports" element={<CostReportsPage />} />
            <Route path="production/planning" element={<ProductionPlanningDashboardPage />} />
            <Route path="production/planning/plans" element={<ProductionPlanListPage />} />
            <Route path="production/planning/plans/new" element={<ProductionPlanFormPage />} />
            <Route path="production/planning/plans/:id" element={<ProductionPlanDetailPage />} />
            <Route path="production/planning/materials" element={<MaterialRequirementsPage />} />
            <Route path="production/planning/capacity" element={<CapacityPlanningPage />} />
            <Route path="production/planning/schedule" element={<ProductionSchedulePage />} />
            <Route path="production/planning/calendar" element={<ProductionCalendarPage />} />
            <Route path="production/planning/reports" element={<PlanningReportsPage />} />
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
            <Route path="quality/defects" element={<DefectsListPage />} />
            <Route path="quality/ncr" element={<NCRListPage />} />
            <Route path="quality/ncr/new" element={<NCRFormPage />} />
            <Route path="quality/ncr/:id" element={<NCRDetailPage />} />
            <Route path="quality/capa" element={<CAPAListPage />} />
            <Route path="quality/capa/new" element={<CAPAFormPage />} />
            <Route path="quality/capa/:id" element={<CAPADetailPage />} />
            <Route path="quality/holds" element={<QualityHoldListPage />} />
            <Route path="quality/quarantine" element={<QuarantineListPage />} />
            <Route path="quality/suppliers" element={<SupplierQualityPage />} />
            <Route path="quality/complaints" element={<CustomerComplaintsListPage />} />
            <Route path="quality/complaints/new" element={<CustomerComplaintFormPage />} />
            <Route path="quality/reports" element={<QualityReportsPage />} />
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
            <Route path="maintenance/plans" element={<MaintenanceScheduleListPage />} />
            <Route path="maintenance/schedule" element={<MaintenanceScheduleListPage />} />
            <Route path="maintenance/schedules" element={<MaintenanceScheduleListPage />} />
            <Route path="maintenance/schedules/new" element={<MaintenanceScheduleFormPage />} />
            <Route path="maintenance/calendar" element={<MaintenanceCalendarPage />} />
            <Route path="maintenance/requests" element={<MaintenanceRequestListPage />} />
            <Route path="maintenance/breakdowns" element={<BreakdownListPage />} />
            <Route path="maintenance/downtime" element={<DowntimeListPage />} />
            <Route path="maintenance/history" element={<MaintenanceHistoryPage />} />
            <Route path="maintenance/reliability" element={<ReliabilityDashboardPage />} />
            <Route path="maintenance/spare-parts" element={<SparePartsPage />} />
            <Route path="maintenance/costs" element={<MaintenanceCostsPage />} />
            <Route path="maintenance/reports" element={<MaintenanceReportsPage />} />
          </Route>

          {/* Commercial Quotations Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'sales_manager', 'executive']} />}>
            <Route path="quotations" element={<AdvancedQuotationListPage />} />
            <Route path="quotations/new" element={<QuotationFormPage />} />
            <Route path="quotations/:id" element={<AdvancedQuotationDetailPage />} />
            <Route path="quotations/:id/edit" element={<QuotationFormPage />} />
          </Route>

          {/* Advanced Sales & Distribution Order-to-Cash Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'sales_manager', 'warehouse_manager', 'finance', 'accountant', 'executive']} />}>
            <Route path="sales" element={<SalesDashboardPage />} />
            <Route path="sales/dashboard" element={<SalesDashboardPage />} />
            <Route path="sales/quotations" element={<AdvancedQuotationListPage />} />
            <Route path="sales/quotations/new" element={<QuotationFormPage />} />
            <Route path="sales/quotations/:id" element={<AdvancedQuotationDetailPage />} />
            <Route path="sales/fulfillment" element={<OrderFulfillmentPage />} />
            <Route path="sales/picking" element={<PickingListPage />} />
            <Route path="sales/packing" element={<PackingListPage />} />
            <Route path="sales/deliveries" element={<DeliveryListPage />} />
            <Route path="sales/deliveries/:id" element={<DeliveryDetailPage />} />
            <Route path="sales/returns" element={<SalesReturnListPage />} />
            <Route path="sales/credit-notes" element={<CreditNotesListPage />} />
            <Route path="sales/pricing" element={<PricingManagementPage />} />
            <Route path="sales/reports" element={<SalesReportsPage />} />
          </Route>

          {/* Sales Orders Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'sales_manager', 'executive']} />}>
            <Route path="sales-orders" element={<SalesOrderListPage />} />
            <Route path="sales-orders/new" element={<SalesOrderFormPage />} />
            <Route path="sales-orders/:id" element={<SalesOrderDetailPage />} />
            <Route path="sales-orders/:id/edit" element={<SalesOrderFormPage />} />
          </Route>

          {/* Suppliers & Contacts Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'purchase_manager', 'warehouse_manager', 'quality_manager', 'finance', 'executive']} />}>
            <Route path="procurement/dashboard" element={<ProcurementDashboardPage />} />
            <Route path="procurement/comparison" element={<QuotationComparisonPage />} />
            <Route path="procurement/returns" element={<SupplierReturnsPage />} />
            <Route path="procurement/three-way-match" element={<ThreeWayMatchPage />} />
            <Route path="procurement/reports" element={<ProcurementReportsPage />} />

            {/* Document Management & Digital Approvals Routes */}
            <Route path="documents/dashboard" element={<DocumentDashboardPage />} />
            <Route path="documents/library" element={<DocumentLibraryPage />} />
            <Route path="documents/approvals" element={<DocumentApprovalsPage />} />
            <Route path="documents/recent" element={<RecentDocumentsPage />} />
            <Route path="documents/expiring" element={<ExpiringDocumentsPage />} />
            <Route path="documents/types" element={<DocumentTypesPage />} />
            <Route path="documents/categories" element={<DocumentCategoriesPage />} />
            <Route path="documents/reports" element={<DocumentReportsPage />} />
            <Route path="documents/:id" element={<DocumentDetailPage />} />

            <Route path="suppliers" element={<SupplierListPage />} />
            <Route path="suppliers/new" element={<SupplierCreatePage />} />
            <Route path="suppliers/:id" element={<SupplierDetailPage />} />
            <Route path="suppliers/:id/edit" element={<SupplierEditPage />} />
            <Route path="suppliers/:id/contacts" element={<SupplierContactsPage />} />
          </Route>

          {/* Notifications & Communication Center Routes (All Authenticated Users) */}
          <Route element={<ProtectedRoute />}>
            <Route path="notifications" element={<NotificationDashboardPage />} />
            <Route path="notifications/all" element={<NotificationDashboardPage />} />
            <Route path="notifications/unread" element={<NotificationDashboardPage />} />
            <Route path="notifications/mentions" element={<NotificationDashboardPage />} />
            <Route path="notifications/approvals" element={<NotificationDashboardPage />} />
            <Route path="notifications/reminders" element={<NotificationDashboardPage />} />
            <Route path="notifications/settings" element={<NotificationSettingsPage />} />
            <Route path="notifications/reports" element={<NotificationReportsPage />} />

            {/* Workflow & Approval Engine Routes (All Authenticated Users) */}
            <Route path="workflows" element={<WorkflowDashboardPage />} />
            <Route path="workflows/definitions" element={<WorkflowDefinitionsPage />} />
            <Route path="workflows/definitions/:id" element={<WorkflowBuilderPage />} />
            <Route path="workflows/instances" element={<WorkflowInstancesPage />} />
            <Route path="workflows/instances/:id" element={<WorkflowInstancesPage />} />
            <Route path="workflows/tasks" element={<WorkflowTasksPage />} />
            <Route path="workflows/approvals" element={<WorkflowTasksPage />} />
            <Route path="workflows/history" element={<WorkflowHistoryPage />} />
            <Route path="workflows/reports" element={<WorkflowReportsPage />} />
            <Route path="workflows/settings" element={<WorkflowSettingsPage />} />
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
            <Route path="employees/departments" element={<DepartmentsPage />} />
            <Route path="employees/organization" element={<OrganizationStructurePage />} />
            <Route path="employees/:id" element={<EmployeeDetailPage />} />
            <Route path="employees/:id/edit" element={<EmployeeEditPage />} />

            <Route path="hr" element={<HRDashboardPage />} />
            <Route path="hr/employees" element={<HREmployeeListPage />} />
            <Route path="hr/departments" element={<DepartmentsPage />} />
            <Route path="hr/organization" element={<OrganizationStructurePage />} />
            <Route path="hr/reports" element={<HRReportsPage />} />
            <Route path="hr/attendance" element={<HRAttendanceListPage />} />
            <Route path="hr/attendance/overtime" element={<OvertimePage />} />
            <Route path="hr/attendance/calendar-settings" element={<WorkingCalendarPage />} />
            <Route path="hr/leave" element={<HRLeaveListPage />} />
            <Route path="hr/leave/requests" element={<HRLeaveRequestListPage />} />
            <Route path="hr/leave/types" element={<HRLeaveTypeListPage />} />
            <Route path="hr/shifts" element={<HRShiftListPage />} />
            <Route path="hr/holidays" element={<HRHolidayListPage />} />
          </Route>

          {/* Payroll Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'hr', 'payroll', 'finance']} />}>
            <Route path="payroll" element={<PayrollDashboardPage />} />
            <Route path="payroll/periods" element={<PayrollPeriodsPage />} />
            <Route path="payroll/runs" element={<PayrollRunsPage />} />
            <Route path="payroll/runs/:id" element={<PayrollRunDetailPage />} />
            <Route path="payroll/compensations" element={<CompensationManagementPage />} />
            <Route path="payroll/payslips" element={<PayslipsPage />} />
            <Route path="payroll/reports" element={<PayrollReportsPage />} />
          </Route>

          {/* Employee Self-Service (My HR) Routes — Accessible to All Staff */}
          <Route path="my-hr" element={<MyHRDashboardPage />} />
          <Route path="my-hr/attendance" element={<MyAttendancePage />} />
          <Route path="my-hr/leave" element={<MyLeavePage />} />
          <Route path="my-hr/payslips" element={<PayslipsPage />} />

          {/* Commercial Sales Invoices Authorized Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'sales_manager', 'finance', 'accountant', 'executive']} />}>
            <Route path="sales/invoices" element={<InvoiceListPage />} />
            <Route path="sales/invoices/new" element={<InvoiceFormPage />} />
            <Route path="sales/invoices/:id" element={<InvoiceDetailPage />} />
          </Route>

          {/* CRM Module Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'crm_manager', 'sales_manager', 'sales', 'sales_executive', 'hr', 'finance', 'executive', 'accountant']} />}>
            <Route path="crm" element={<CRMDashboardPage />} />
            <Route path="crm/leads" element={<LeadsListPage />} />
            <Route path="crm/leads/:id" element={<LeadDetailPage />} />
            <Route path="crm/opportunities" element={<OpportunitiesListPage />} />
            <Route path="crm/opportunities/:id" element={<OpportunityDetailPage />} />
            <Route path="crm/pipeline" element={<PipelineBoardPage />} />
            <Route path="crm/activities" element={<ActivitiesListPage />} />
            <Route path="crm/tasks" element={<TasksListPage />} />
            <Route path="crm/follow-ups" element={<FollowupsListPage />} />
            <Route path="crm/customers/:customerId/timeline" element={<CustomerTimelinePage />} />
            <Route path="crm/reports" element={<CRMReportsPage />} />
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

            {/* Expense Management & Reimbursement Routes */}
            <Route path="finance/expenses" element={<ExpenseDashboardPage />} />
            <Route path="finance/expenses/claims" element={<ExpenseClaimListPage />} />
            <Route path="finance/expenses/claims/new" element={<ExpenseClaimFormPage />} />
            <Route path="finance/expenses/claims/:id" element={<ExpenseClaimDetailPage />} />
            <Route path="finance/expenses/claims/:id/edit" element={<ExpenseClaimFormPage />} />
            <Route path="finance/expenses/my" element={<MyExpensesPage />} />
            <Route path="finance/expenses/categories" element={<ExpenseCategoryListPage />} />
            <Route path="finance/expenses/reimbursements" element={<ReimbursementListPage />} />
            <Route path="finance/expenses/reports" element={<ExpenseReportsPage />} />

            {/* Fixed Assets & Depreciation Routes */}
            <Route path="finance/assets" element={<FixedAssetDashboardPage />} />
            <Route path="finance/assets/list" element={<FixedAssetListPage />} />
            <Route path="finance/assets/new" element={<FixedAssetFormPage />} />
            <Route path="finance/assets/categories" element={<FixedAssetCategoryListPage />} />
            <Route path="finance/assets/depreciation" element={<DepreciationManagementPage />} />
            <Route path="finance/assets/transfers" element={<AssetTransferListPage />} />
            <Route path="finance/assets/disposals" element={<AssetDisposalListPage />} />
            <Route path="finance/assets/reports" element={<FixedAssetReportsPage />} />
            <Route path="finance/assets/:id" element={<FixedAssetDetailPage />} />
            <Route path="finance/assets/:id/edit" element={<FixedAssetFormPage />} />

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

          {/* Admin & System Settings Restricted Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'master_admin', 'executive', 'sales_manager', 'finance', 'hr']} />}>
            <Route path="users" element={<UserSettingsPage />} />
            <Route path="settings" element={<SettingsDashboardPage />} />
            <Route path="settings/general" element={<GeneralSettingsPage />} />
            <Route path="settings/organization" element={<OrganizationSettingsPage />} />
            <Route path="settings/locations" element={<LocationSettingsPage />} />
            <Route path="settings/departments" element={<DepartmentSettingsPage />} />
            <Route path="settings/users" element={<UserSettingsPage />} />
            <Route path="settings/roles" element={<RoleSettingsPage />} />
            <Route path="settings/permissions" element={<PermissionSettingsPage />} />
            <Route path="settings/numbering" element={<NumberingSettingsPage />} />
            <Route path="settings/currencies" element={<CurrencySettingsPage />} />
            <Route path="settings/units" element={<UnitSettingsPage />} />
            <Route path="settings/statuses" element={<StatusSettingsPage />} />
            <Route path="settings/masters" element={<MasterSettingsPage />} />
            <Route path="settings/security" element={<SecuritySettingsPage />} />
            <Route path="settings/audit" element={<AuditSettingsPage />} />
            <Route path="master-admin" element={<MasterAdminControlPage />} />
          </Route>

          {/* Centralized Advanced Reporting & Analytics Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'master_admin', 'executive', 'sales_manager', 'procurement_manager', 'inventory_manager', 'production_manager', 'quality_manager', 'maintenance_manager', 'hr', 'finance']} />}>
            <Route path="reports" element={<ReportsExecutiveDashboardPage />} />
            <Route path="reports/dashboard" element={<ReportsExecutiveDashboardPage />} />
            <Route path="reports/sales" element={<SalesReportPage />} />
            <Route path="reports/procurement" element={<ProcurementReportPage />} />
            <Route path="reports/inventory" element={<InventoryReportPage />} />
            <Route path="reports/production" element={<ProductionReportPage />} />
            <Route path="reports/quality" element={<QualityReportPage />} />
            <Route path="reports/maintenance" element={<MaintenanceReportPage />} />
            <Route path="reports/crm" element={<CRMReportPage />} />
            <Route path="reports/documents" element={<DocumentReportPage />} />
            <Route path="reports/workflows" element={<WorkflowReportPage />} />
            <Route path="reports/custom" element={<CustomSavedReportsPage />} />
          </Route>

          {/* Restricted HR & Finance Reports */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'master_admin', 'executive', 'hr']} />}>
            <Route path="reports/hr" element={<HRReportPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['admin', 'master_admin', 'executive', 'finance']} />}>
            <Route path="reports/finance" element={<FinanceReportPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['admin', 'master_admin', 'executive']} />}>
            <Route path="reports/audit" element={<AuditReportPage />} />
          </Route>

          {/* Centralized Audit, Security & Compliance Hardening Module Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'master_admin', 'security_officer']} />}>
            <Route path="security" element={<SecurityOverviewPage />} />
            <Route path="security/overview" element={<SecurityOverviewPage />} />
            <Route path="security/access" element={<AccessControlSecurityPage />} />
            <Route path="security/sessions" element={<SessionSecurityPage />} />
            <Route path="security/events" element={<SecurityEventsPage />} />
            <Route path="security/policies" element={<SecurityPoliciesPage />} />
            <Route path="security/audit" element={<SecurityAuditPage />} />
            <Route path="security/reports" element={<SecurityReportsPage />} />
          </Route>

          {/* Global Search Routes (Authenticated Users) */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'master_admin', 'executive', 'sales_manager', 'procurement_manager', 'inventory_manager', 'production_manager', 'quality_manager', 'maintenance_manager', 'hr', 'finance', 'staff']} />}>
            <Route path="search" element={<SearchResultsPage />} />
            <Route path="search/results" element={<SearchResultsPage />} />
            <Route path="activity" element={<MyActivityPage />} />
            <Route path="activity/my" element={<MyActivityPage />} />
            <Route path="activity/team" element={<TeamActivityPage />} />
          </Route>

          {/* System Security Activity Route (Restricted to Admin / Security Officer) */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'master_admin', 'security_officer']} />}>
            <Route path="activity/system" element={<SystemActivityPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback Catch-all Route to Public 404 */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  </SystemSettingsProvider>
  );
};
