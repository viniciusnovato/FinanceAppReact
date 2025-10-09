import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from '../src/routes';
import { logger } from '../src/middlewares/logger';
import { errorHandler, notFound } from '../src/middlewares/errorHandler';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration - Updated for Vercel deployment
app.use(cors({
  origin: [
    'http://localhost:8081',
    'http://localhost:3000',
    'http://127.0.0.1:8081',
    'http://127.0.0.1:3000',
    'https://*.vercel.app',
    process.env.FRONTEND_URL || 'https://your-frontend-domain.vercel.app'
  ],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(logger);

// API routes
app.use('/api', routes);

// Root route
app.get('/', (_req, res) => {
  res.json({
    message: 'ERP Payment Management API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Export the Express app for Vercel
export default app;