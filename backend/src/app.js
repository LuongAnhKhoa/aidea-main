import cors from 'cors';
import express from 'express';
import v1Router from './routes/v1.routes.js';

export function createApp() {
  const app = express();
  const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origin is not allowed by CORS.'));
    },
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Local-Test-Mode'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use('/api/v1', v1Router);
  app.use((_req, res) => res.status(404).json({ error: 'API endpoint not found.' }));
  app.use((error, _req, res, _next) => {
    console.error('API request failed:', error);
    const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500
      ? error.status
      : 500;
    res.status(status).json({
      error: status === 500 ? 'An unexpected server error occurred.' : 'Invalid request.',
    });
  });

  return app;
}
