const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const dotenv = require('dotenv');

dotenv.config();

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const erpRoutes = require('./routes/erp.routes');
const rfqRoutes = require('./routes/rfq.routes');
const employeeRoutes = require('./routes/employee.routes');
const productRoutes = require('./routes/product.routes');
const customerRoutes = require('./routes/customer.routes');
const supplierRoutes = require('./routes/supplier.routes');
const quotationRoutes = require('./routes/quotation.routes');
const salesOrderRoutes = require('./routes/sales_order.routes');
const procurementRoutes = require('./routes/procurement.routes');
const grnRoutes = require('./routes/grn.routes');
const warehouseRoutes = require('./routes/warehouse.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const productionRoutes = require('./routes/production.routes');
const qualityRoutes = require('./routes/quality.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const hrRoutes = require('./routes/hr_operations.routes');
const financeRoutes = require('./routes/finance.routes');
const salesInvoiceRoutes = require('./routes/sales_invoice.routes');
const purchaseInvoiceRoutes = require('./routes/purchase_invoice.routes');
const budgetingRoutes = require('./routes/budgeting.routes');
const expenseRoutes = require('./routes/expense.routes');
const assetRoutes = require('./routes/asset.routes');
const costingRoutes = require('./routes/costing.routes');
const planningRoutes = require('./routes/planning.routes');
const systemSettingsRoutes = require('./routes/system_settings.routes');
const payrollRoutes = require('./routes/payroll.routes');
const crmRoutes = require('./routes/crm.routes');
const salesDistributionRoutes = require('./routes/sales_distribution.routes');
const procurementP2PRoutes = require('./routes/procurement_p2p.routes');
const documentRoutes = require('./routes/document.routes');
const notificationRoutes = require('./routes/notification.routes');
const workflowRoutes = require('./routes/workflow.routes');
const settingsRoutes = require('./routes/settings.routes');
const reportsRoutes = require('./routes/reports.routes');
const securityRoutes = require('./routes/security.routes');
const searchRoutes = require('./routes/search.routes');
const activityRoutes = require('./routes/activity.routes');
const { publicRouter: rfqPublicRoutes, erpRouter: rfqErpRoutes } = require('./routes/rfq.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Logging Middlewares
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  'https://kolmeks-manufacturing-erp.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS Policy: Request origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// URL Rewrite Middleware: Support requests with or without /api prefix
app.use((req, res, next) => {
  if (!req.path.startsWith('/api') && req.path !== '/') {
    req.url = `/api${req.url}`;
  }
  next();
});

// Register API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/erp', erpRoutes);
app.use('/api/rfq', rfqPublicRoutes);
app.use('/api/rfqs', rfqErpRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/sales-orders', salesOrderRoutes);
app.use('/api', grnRoutes);
app.use('/api', procurementRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/sales', salesInvoiceRoutes);
app.use('/api/finance', salesInvoiceRoutes);
app.use('/api', purchaseInvoiceRoutes);
app.use('/api', budgetingRoutes);
app.use('/api', expenseRoutes);
app.use('/api', assetRoutes);
app.use('/api/production/costing', costingRoutes);
app.use('/api/production/wip', costingRoutes);
app.use('/api/production/planning', planningRoutes);
app.use('/api/system', systemSettingsRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/sales', salesDistributionRoutes);
app.use('/api/procurement/p2p', procurementP2PRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/activity', activityRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Kolmeks Contract Manufacturing & ERP API',
    documentation: '/api/health',
  });
});

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Resource not found: ${req.method} ${req.originalUrl}`,
      code: 'NOT_FOUND',
    },
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Start Express Server
app.listen(PORT, () => {
  console.log(`
  ═════════════════════════════════════════════════════════════════
  🏭 KOLMEKS MANUFACTURING ERP BACKEND API
  ═════════════════════════════════════════════════════════════════
  📡 Server Status : RUNNING
  🌐 Local URL     : http://localhost:${PORT}
  🏥 Health Check  : http://localhost:${PORT}/api/health
  🔒 Auth Endpoint : http://localhost:${PORT}/api/auth/me
  ⚙️ Environment   : ${process.env.NODE_ENV || 'development'}
  ═════════════════════════════════════════════════════════════════
  `);
});
