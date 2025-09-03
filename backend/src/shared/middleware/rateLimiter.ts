import { rateLimit } from 'express-rate-limit';
import AppError from '@shared/utils/appError';

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next, options) => {
    next(new AppError(options.message, 429));
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts from this IP, please try again after 5 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next, options) => {
    next(new AppError(options.message, 429));
  },
});