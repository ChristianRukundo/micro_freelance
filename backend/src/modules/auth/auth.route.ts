import { Router } from 'express';
import authController from './auth.controller';
import { authRateLimiter, apiRateLimiter } from '@shared/middleware/rateLimiter';
import { validateRequest } from '@shared/middleware/validateRequest';
import {
  registerSchema,
  verifyEmailSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.validation';

const router = Router();

router.post('/register', authRateLimiter, validateRequest({ body: registerSchema }), authController.register);
router.post('/verify-email', authRateLimiter, validateRequest({ body: verifyEmailSchema }), authController.verifyEmail);
router.post(
  '/resend-verification-email',
  authRateLimiter,
  validateRequest({ body: loginSchema.pick({ email: true }) }),
  authController.resendVerificationEmail,
);
router.post('/login', authRateLimiter, validateRequest({ body: loginSchema }), authController.login);
router.post('/logout', apiRateLimiter, authController.logout);
router.post('/refresh-token', apiRateLimiter, authController.refreshToken); 
router.post(
  '/forgot-password',
  authRateLimiter,
  validateRequest({ body: forgotPasswordSchema }),
  authController.forgotPassword,
);
router.post(
  '/reset-password',
  authRateLimiter,
  validateRequest({ body: resetPasswordSchema }),
  authController.resetPassword,
);

export default router;
