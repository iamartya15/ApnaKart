import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/place', requireAuth as any, OrderController.placeOrder as any);
router.get('/history', requireAuth as any, OrderController.getHistory as any);
router.post('/cancel/:orderId', requireAuth as any, OrderController.cancelOrder as any);
router.post('/return/:orderId', requireAuth as any, OrderController.returnOrder as any);
router.get('/invoice/:orderId', requireAuth as any, OrderController.getInvoice as any);

export default router;
