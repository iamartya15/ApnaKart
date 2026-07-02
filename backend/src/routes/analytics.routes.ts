import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/funnel', requireAuth as any, AnalyticsController.getFunnelMetrics as any);

export default router;
