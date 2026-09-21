import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { standardRateLimiter } from './middleware/rateLimit.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { NotFoundError } from './utils/errors.js';

// Route Imports
import healthRoutes from './routes/health.routes.js';
import profileRoutes from './routes/profile.routes.js';
import conversationRoutes from './routes/conversation.routes.js';
import chatRoutes from './routes/chat.routes.js';
import memoryRoutes from './routes/memory.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';

const app = express();

// Security Headers
app.use(helmet());

// CORS configuration restricted to frontend
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('CORS policy: This origin is not authorized.'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsers with safe payload limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global Rate Limiting for standard routes
app.use('/api', standardRateLimiter);

// API Route Mounts
app.use('/api/health', healthRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/feedback', feedbackRoutes);

// Catch-all 404 handler
app.use('*', (req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
