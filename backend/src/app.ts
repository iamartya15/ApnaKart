import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import router from './routes';
import { errorHandler } from './middleware/error.middleware';

import cookieParser from 'cookie-parser';
import { csrfProtection } from './middleware/csrf.middleware';

const app = express();

// Security middleware
app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: '*', // Allow all in dev, configure as needed
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN'],
  }),
);
app.use(csrfProtection);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

import { xssClean } from './middleware/xss.middleware';
app.use(xssClean);

// Request logging
app.use(morgan('dev'));

// Main API routes base
app.use('/api', router);

// Catch-all route for unmatched paths
app.use((req, res, _next) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Error handling middleware
app.use(errorHandler);

export default app;
