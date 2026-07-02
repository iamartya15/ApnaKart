import { Router, Request, Response } from 'express';

import authRouter from './auth.routes';
import userRouter from './user.routes';
import searchRouter from './search.routes';
import compareRouter from './compare.routes';

import aiRouter from './ai.routes';
import cartRouter from './cart.routes';
import checkoutRouter from './checkout.routes';
import paymentRouter from './payment.routes';
import orderRouter from './order.routes';
import analyticsRouter from './analytics.routes';
import adminRouter from './admin.routes';

import mongoose from 'mongoose';
import { redisClient } from '../config/redis';

const router = Router();

// Health check (Legacy compat)
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      redis: redisClient.isOpen ? 'ready' : 'closed',
    },
  });
});

// Liveness probe (Immediate ping)
router.get('/liveness', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

// Readiness probe (DB + cache availability test)
router.get('/readiness', async (req: Request, res: Response) => {
  const isMongoReady = mongoose.connection.readyState === 1;
  const isRedisReady = redisClient.isOpen;

  if (!isMongoReady || !isRedisReady) {
    res.status(503).json({
      status: 'unready',
      mongodb: isMongoReady ? 'ready' : 'unavailable',
      redis: isRedisReady ? 'ready' : 'unavailable',
    });
    return;
  }

  res.status(200).json({ status: 'ready' });
});

// Prometheus System Metrics Endpoint
router.get('/metrics', (req: Request, res: Response) => {
  const mem = process.memoryUsage();
  res.status(200).send(
    `
# HELP node_memory_rss_bytes Resident Set Size memory usage
# TYPE node_memory_rss_bytes gauge
node_memory_rss_bytes ${mem.rss}

# HELP node_memory_heap_total_bytes Total heap size allocated
# TYPE node_memory_heap_total_bytes gauge
node_memory_heap_total_bytes ${mem.heapTotal}

# HELP node_memory_heap_used_bytes Heap memory used
# TYPE node_memory_heap_used_bytes gauge
node_memory_heap_used_bytes ${mem.heapUsed}

# HELP node_uptime_seconds Application process uptime
# TYPE node_uptime_seconds counter
node_uptime_seconds ${process.uptime()}
  `.trim(),
  );
});

// Dynamic Sitemap generator route for SEO crawling
router.get('/sitemap.xml', (req: Request, res: Response) => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://apnakart.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://apnakart.com/search</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://apnakart.com/compare</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://apnakart.com/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(sitemap);
});

// Subroutes registration
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/search', searchRouter);
router.use('/compare', compareRouter);
router.use('/ai', aiRouter);
router.use('/cart', cartRouter);
router.use('/checkout', checkoutRouter);
router.use('/payments', paymentRouter);
router.use('/orders', orderRouter);
router.use('/analytics', analyticsRouter);
router.use('/admin', adminRouter);

export default router;
