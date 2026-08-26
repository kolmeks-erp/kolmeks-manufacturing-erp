const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const erpRoutes = require('./routes/erp.routes');
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
