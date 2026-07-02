import { Router } from 'express';
import { CheckoutController } from '../controllers/checkout.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/', requireAuth as any, CheckoutController.computeCheckout as any);
router.post('/seed-coupons', CheckoutController.seedCoupons as any);

export default router;
