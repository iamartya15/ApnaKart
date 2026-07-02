import { Router } from 'express';
import { CompareController } from '../controllers/compare.controller';

const router = Router();

router.get('/', CompareController.compare as any);

export default router;
