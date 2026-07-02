import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';

const router = Router();

router.post('/parse-search', AIController.parseSearch as any);
router.get('/product-summary/:productId', AIController.getProductSummary as any);
router.get('/review-trust/:productId', AIController.analyzeReviewsTrust as any);
router.get('/seller-trust/:sellerId', AIController.evaluateSellerTrust as any);
router.post('/gift', AIController.findGifts as any);
router.post('/budget-combo', AIController.computeBudgetCombo as any);
router.post('/outfit', AIController.recommendOutfit as any);
router.get('/chat-history/:conversationId', AIController.getChatHistory as any);

export default router;
