import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { requireAuth, requireAdminRole } from '../middleware/auth.middleware';

const router = Router();

// Protect all admin routes using requireAuth first
router.use(requireAuth as any);

router.get(
  '/stats',
  requireAdminRole(['super_admin', 'admin', 'viewer', 'finance']) as any,
  AdminController.getDashboardStats as any,
);
router.get(
  '/users',
  requireAdminRole(['super_admin', 'admin', 'moderator', 'support']) as any,
  AdminController.getUsers as any,
);
router.put(
  '/users/:userId',
  requireAdminRole(['super_admin', 'admin', 'moderator']) as any,
  AdminController.updateUserState as any,
);
router.get(
  '/audit-logs',
  requireAdminRole(['super_admin', 'admin']) as any,
  AdminController.getAuditLogs as any,
);
router.get(
  '/health',
  requireAdminRole(['super_admin', 'admin']) as any,
  AdminController.getSystemHealth as any,
);
router.get(
  '/campaigns',
  requireAdminRole(['super_admin', 'admin', 'marketing']) as any,
  AdminController.getCampaigns as any,
);
router.post(
  '/campaigns',
  requireAdminRole(['super_admin', 'admin', 'marketing']) as any,
  AdminController.createCampaign as any,
);
router.get(
  '/export',
  requireAdminRole(['super_admin', 'admin', 'finance']) as any,
  AdminController.exportReport as any,
);

export default router;
