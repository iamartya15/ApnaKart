import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { rateLimiter } from '../middleware/rate-limiter.middleware';
import {
  registerSchema,
  loginSchema,
  otpGenerateSchema,
  otpVerifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../utils/validation-schemas';

const router = Router();

// Apply strict rate limiting on Auth routes (max 10 requests per minute)
const authLimiter = rateLimiter(10, 60);

router.post('/signup', authLimiter, validate(registerSchema), AuthController.signup);
router.get('/verify-email', AuthController.verifyEmail);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);

router.post('/generate-otp', authLimiter, validate(otpGenerateSchema), AuthController.generateOTP);
router.post('/verify-otp', authLimiter, validate(otpVerifySchema), AuthController.verifyOTP);

router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  AuthController.forgotPassword,
);
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  AuthController.resetPassword,
);

router.post('/refresh', AuthController.refresh);
router.post('/social-login', authLimiter, AuthController.socialLogin);
router.post('/logout', AuthController.logout);

// Official OAuth flows
router.get('/google', AuthController.googleRedirect);
router.get('/google/callback', AuthController.googleCallback);
router.get('/github', AuthController.githubRedirect);
router.get('/github/callback', AuthController.githubCallback);

export default router;
