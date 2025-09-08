import { Router } from 'express';
import userController from './user.controller';
import { authorize, protect } from '@shared/middleware/auth.middleware';
import { validateRequest } from '@shared/middleware/validateRequest';
import { z } from 'zod';
import { changePasswordSchema } from './user.validation';
import { UserRole } from '@prisma/client';

const router = Router();

// Zod schema for updateMe, defined here for the validateRequest middleware
const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name cannot be empty').optional(),
  lastName: z.string().min(1, 'Last name cannot be empty').optional(),
  avatarUrl: z.string().url('Avatar URL must be a valid URL').optional().nullable(),
  bio: z.string().optional().nullable(),
  skills: z.array(z.string().min(1)).optional(),
  portfolioLinks: z.array(z.string().url('Portfolio links must be valid URLs')).optional(),
});
router.patch('/me/change-password', validateRequest({ body: changePasswordSchema }), userController.changePassword);
router.use(protect); // All routes below this use authentication

router.get('/me', userController.getMe);
router.put('/me', validateRequest({ body: updateProfileSchema }), userController.updateMe);

router.get('/dashboard/client-stats', authorize(UserRole.CLIENT), userController.getClientDashboardStats);
router.get('/dashboard/freelancer-stats', authorize(UserRole.FREELANCER), userController.getFreelancerDashboardStats);

export default router;
