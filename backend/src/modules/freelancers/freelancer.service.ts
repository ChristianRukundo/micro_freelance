// backend/src/modules/freelancers/freelancer.service.ts

import prisma from '@shared/database/prisma';
import { UserRole, Prisma } from '@prisma/client';
import AppError from '@shared/utils/appError';

interface FreelancerQuery {
  page?: number;
  limit?: number;
  q?: string;
  sortBy?: 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

class FreelancerService {
  public async getAllFreelancers(query: FreelancerQuery) {
    const { page = 1, limit = 10, q, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      role: UserRole.FREELANCER,
      // We only want to show freelancers who have completed their profiles
      profile: {
        isNot: null,
      },
    };

    if (q) {
      where.OR = [
        { profile: { firstName: { contains: q, mode: 'insensitive' } } },
        { profile: { lastName: { contains: q, mode: 'insensitive' } } },
        { email: { contains: q, mode: 'insensitive' } },
        { profile: { bio: { contains: q, mode: 'insensitive' } } },
        { profile: { skills: { has: q } } },
      ];
    }

    const orderBy: Prisma.UserOrderByWithRelationInput = {};
    if (sortBy === 'name') {
      orderBy.profile = { firstName: sortOrder };
    } else {
      orderBy.createdAt = sortOrder;
    }

    const freelancers = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        email: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
            bio: true,
            skills: true,
          },
        },
        // Optionally, include stats in the future
        // _count: { select: { tasksAsFreelancer: { where: { status: 'COMPLETED' } } } }
      },
    });

    const totalFreelancers = await prisma.user.count({ where });

    return {
      freelancers,
      totalFreelancers,
      page,
      limit,
      totalPages: Math.ceil(totalFreelancers / limit),
    };
  }

  public async getFreelancerById(id: string) {
    const freelancer = await prisma.user.findFirst({
      where: {
        id,
        role: UserRole.FREELANCER,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
            bio: true,
            skills: true,
            portfolioLinks: true,
          },
        },
        // We can add more detailed stats here later, like ratings, completed jobs, etc.
      },
    });

    if (!freelancer) {
      throw new AppError('Freelancer not found.', 404);
    }

    return freelancer;
  }
}

export default new FreelancerService();