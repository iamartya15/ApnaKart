import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateProfileSchema, addressSchema } from '../utils/validation-schemas';

const router = Router();

// Profile endpoints (Auth required)
router.get('/profile', requireAuth as any, UserController.getProfile as any);
router.put(
  '/profile',
  requireAuth as any,
  validate(updateProfileSchema),
  UserController.updateProfile as any,
);

// Address endpoints (Auth required)
router.post(
  '/addresses',
  requireAuth as any,
  validate(addressSchema),
  UserController.addAddress as any,
);
router.put(
  '/addresses/:addressId',
  requireAuth as any,
  validate(addressSchema),
  UserController.updateAddress as any,
);
router.delete('/addresses/:addressId', requireAuth as any, UserController.deleteAddress as any);

export default router;
