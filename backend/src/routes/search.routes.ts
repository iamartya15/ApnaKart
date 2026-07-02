import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';

const router = Router();

router.get('/', SearchController.search as any);
router.get('/autocomplete', SearchController.autocomplete as any);
router.get('/meta', SearchController.getMetadata as any);

export default router;
