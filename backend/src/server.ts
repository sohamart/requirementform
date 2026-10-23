import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './config/db.js';
import { ENV } from './config/env.js';
import { authenticateSession } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import domainFinderRoutes from './routes/domainFinderRoutes.js';
import { runSeed } from './seed/seed.js';
import { User } from './models/User.js';

export const app = express();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible SPA serving in local dev
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration for Cookie-based sessions
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost and specified client origin
      if (!origin || origin === ENV.CLIENT_URL || origin.includes('localhost')) {
        callback(null, true);
      } else {
        callback(null, true); // Dev convenience
      }
    },
    credentials: true,
  })
);

app.use(cookieParser(ENV.COOKIE_SECRET));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Ensure DB connection before servicing ANY API requests (critical on serverless cold starts)
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err: any) {
      console.error('[Database] Middleware connection error:', err);
      return res.status(500).json({
        success: false,
        error: 'Database Connection Error',
        message: err.message || 'Unable to connect to MongoDB Atlas database',
      });
    }
  }
  next();
});

// Session Authentication Middleware (attaches req.user & req.sessionRecord if token present)
app.use(authenticateSession);

// Global API rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get(['/api/v1/health', '/v1/health', '/health', '/'], (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'healthy' : 'degraded',
    database: isDbConnected ? 'connected' : 'disconnected',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV,
  });
});

// Mount Versioned API Routes (Support both with and without /api prefix from reverse proxies)
app.use('/api/v1/auth', authRoutes);
app.use('/v1/auth', authRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/v1/public', publicRoutes);
app.use('/api/v1/submissions', submissionRoutes);
app.use('/v1/submissions', submissionRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/v1/admin', adminRoutes);
app.use('/api/v1/domains', domainFinderRoutes);
app.use('/v1/domains', domainFinderRoutes);

// Centralized Error Handling
app.use(errorHandler);

export async function startServer() {
  await connectDB();

  // If running in development and database has no superadmin, auto-seed!
  const adminExists = await User.findOne({ role: 'superadmin' });
  if (!adminExists) {
    console.log('[Server] No superadmin detected. Running automatic initial database seed...');
    await runSeed();
  }

  const server = app.listen(ENV.PORT, () => {
    console.log(`[Server] Digital Agency Requirement & Financial Portal running on port ${ENV.PORT}`);
    console.log(`[Server] Health Check: http://localhost:${ENV.PORT}/api/v1/health`);
  });

  const shutdown = async () => {
    console.log('[Server] Gracefully shutting down...');
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return server;
}

// Auto-start HTTP server on Render, Railway, Docker, or standalone Node servers
// Never start port listener on Vercel Serverless or in Vitest test runners
const isServerless = !!(process.env.VERCEL || process.env.VERCEL_ENV || process.env.NOW_REGION || process.env.AWS_LAMBDA_FUNCTION_NAME);

if (!isServerless && process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
  });
}

export default app;
