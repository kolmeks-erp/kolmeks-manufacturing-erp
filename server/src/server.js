const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
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
const systemSettingsRoutes = require('./routes/system_settings.routes');
const { publicRouter: rfqPublicRoutes, erpRouter: rfqErpRoutes } = require('./routes/rfq.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Logging Middlewares
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// CORS Configuration
const allowedOrigins = [process.env.CLIENT_ORIGIN || 'http://localhost:5173'];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS Policy: Request origin not allowed'));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api', procurementRoutes);
app.use('/api', grnRoutes);
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
app.use('/api/system', systemSettingsRoutes);

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
