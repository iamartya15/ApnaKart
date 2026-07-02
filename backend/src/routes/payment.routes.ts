import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/session', requireAuth as any, PaymentController.createPaymentSession as any);
router.get('/mock-success', requireAuth as any, PaymentController.mockSuccessRedirect as any);
router.post('/webhook/:provider', PaymentController.handleWebhook as any);

export default router;
