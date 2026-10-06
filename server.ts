import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

import { authenticateToken } from './server/auth.ts';
import authRoutes from './server/routes/authRoutes.ts';
import propertyRoutes from './server/routes/propertyRoutes.ts';
import roommateRoutes from './server/routes/roommateRoutes.ts';
import serviceRoutes from './server/routes/serviceRoutes.ts';
import messagingRoutes from './server/routes/messagingRoutes.ts';
import bookingRoutes from './server/routes/bookingRoutes.ts';
import notificationRoutes from './server/routes/notificationRoutes.ts';
import reportRoutes from './server/routes/reportRoutes.ts';
import adminRoutes from './server/routes/adminRoutes.ts';
import uploadRoutes from './server/routes/uploadRoutes.ts';
import testRoutes from './server/routes/testRoutes.ts';
import contentRoutes from './server/routes/contentRoutes.ts';
import { db } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // Wait for PostgreSQL initialization before any authenticated/API request.
  app.use(async (_req, res, next) => {
    try {
      await db.ready();
      next();
    } catch (err) {
      console.error('[RoomMitra] Database initialization error:', err);
      res.status(503).json({
        error: 'Database is not available. Please try again shortly.',
      });
    }
  });

  // Security headers.
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    next();
  });

  // Keep serverless responses open until queued PostgreSQL writes have flushed.
  // This prevents data mutations from being lost when a Vercel invocation ends.
  app.use((_req, res, next) => {
    const response = res as typeof res & { end: (...args: any[]) => any };
    const originalEnd = response.end.bind(res);
    let ended = false;

    response.end = (...args: any[]) => {
      if (ended) return originalEnd(...args);
      ended = true;
      void db.flush()
        .catch((err) => {
          console.error('[RoomMitra] Failed to flush queued database writes:', err);
        })
        .finally(() => {
          originalEnd(...args);
        });
    };

    next();
  });

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(authenticateToken);

  // Health check.
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      app: 'RoomMitra',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // API routes.
  app.use('/api/auth', authRoutes);
  app.use('/api/properties', propertyRoutes);
  app.use('/api/roommates', roommateRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/messages', messagingRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/content', contentRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/system', testRoutes);

  app.use('/api', (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[RoomMitra] API Error:', err);
    res.status(500).json({
      error: 'An unexpected internal server error occurred. Please try again.',
    });
  });

  // Serve the Vite production build in production. Vercel bundles dist/**
  // with the Node application via vercel.json.
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  return app;
}

const app = await createApp();

export default app;

// Keep the existing local "npm run dev" / "npm start" experience.
// On Vercel the platform owns the HTTP lifecycle and invokes the exported app.
if (process.env.VERCEL !== '1') {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RoomMitra] Server active on http://0.0.0.0:${PORT}`);
  });
}
