// backend/src/modules/freelancers/freelancer.controller.ts

import { Request, Response, NextFunction } from 'express';
import freelancerService from './freelancer.service';
import { z } from 'zod';

const getAllFreelancersQuerySchema = z.object({
  page: z.preprocess(Number, z.number().int().positive().default(1)).optional(),
  limit: z.preprocess(Number, z.number().int().positive().max(100).default(10)).optional(),
  q: z.string().optional(), // Search by name, skills, bio
  sortBy: z.enum(['createdAt', 'name']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

const getFreelancerByIdParamsSchema = z.object({
  id: z.string().cuid('Invalid freelancer ID format'),
});

class FreelancerController {
  public async getAllFreelancers(
    req: Request<unknown, unknown, unknown, z.infer<typeof getAllFreelancersQuerySchema>>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const freelancersData = await freelancerService.getAllFreelancers(req.query);
      res.status(200).json({ success: true, data: freelancersData });
    } catch (error) {
      next(error);
    }
  }

  public async getFreelancerById(
    req: Request<z.infer<typeof getFreelancerByIdParamsSchema>>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const freelancer = await freelancerService.getFreelancerById(id);
      res.status(200).json({ success: true, data: freelancer });
    } catch (error) {
      next(error);
    }
  }
}

export default new FreelancerController();