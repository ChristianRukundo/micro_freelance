// backend/src/modules/freelancers/freelancer.route.ts

import { Router } from 'express';
import freelancerController from './freelancer.controller';
import { validateRequest } from '@shared/middleware/validateRequest';
import { z } from 'zod';

const router = Router();

const getAllFreelancersQuerySchema = z.object({
  page: z.preprocess(Number, z.number().int().positive().default(1)).optional(),
  limit: z.preprocess(Number, z.number().int().positive().max(100).default(10)).optional(),
  q: z.string().optional(),
  sortBy: z.enum(['createdAt', 'name']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

const getFreelancerByIdParamsSchema = z.object({
  id: z.string().cuid('Invalid freelancer ID format'),
});

// All routes in this file are public
router.get('/', validateRequest({ query: getAllFreelancersQuerySchema }), freelancerController.getAllFreelancers);
router.get('/:id', validateRequest({ params: getFreelancerByIdParamsSchema }), freelancerController.getFreelancerById);

export default router;
