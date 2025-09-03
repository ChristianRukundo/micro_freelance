import { Router } from 'express';
import adminController from './admin.controller';
import { protect, authorize } from '@shared/middleware/auth.middleware';
import { adminProtect } from '@shared/middleware/admin.middleware';
import { validateRequest } from '@shared/middleware/validateRequest';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

const router = Router();

// Middleware to protect all admin routes
router.use(protect, authorize(UserRole.ADMIN), adminProtect);

// Validation schemas for admin routes
const userIdParamSchema = z.object({
  userId: z.string().cuid('Invalid user ID format'),
});

const getAllUsersQuerySchema = z.object({
  page: z.preprocess(Number, z.number().int().positive().default(1)).optional(),
  limit: z.preprocess(Number, z.number().int().positive().max(100).default(10)).optional(),
  role: z.enum(UserRole).optional(),
  isSuspended: z.preprocess(
    (val) => (val === 'true' ? true : val === 'false' ? false : undefined),
    z.boolean().optional(),
  ),
  q: z.string().optional(), // Search query for email, first/last name
});

export const updateUserStatusSchema = z.object({
  isSuspended: z.boolean({
    error: 'isSuspended must be a boolean',
  }),
  role: z
    .enum(Object.values(UserRole) as [string, ...string[]], {
      error: 'Invalid user role specified',
    })
    .optional(),
});

router.get('/users', validateRequest({ query: getAllUsersQuerySchema }), adminController.getAllUsers);
router.patch(
  '/users/:userId/status',
  validateRequest({ params: userIdParamSchema, body: updateUserStatusSchema }),
  adminController.updateUserStatus,
);
router.delete('/users/:userId', validateRequest({ params: userIdParamSchema }), adminController.deleteUser);

export default router;
