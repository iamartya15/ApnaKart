import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Guest cart does not require login token, user cart automatically leverages requireAuth
router.get('/', requireAuth as any, CartController.getCart as any);
router.post('/add', requireAuth as any, CartController.addToCart as any);
router.post('/update', requireAuth as any, CartController.updateQuantity as any);
router.post('/merge', requireAuth as any, CartController.mergeCart as any);

export default router;
