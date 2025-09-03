import prisma from '@shared/database/prisma';
import AppError from '@shared/utils/appError';
import { UserRole } from '@prisma/client';

class AdminService {
  public async getAllUsers(
    page: number = 1,
    limit: number = 10,
    role?: UserRole,
    isSuspended?: boolean,
    q?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role) {
      where.role = role;
    }
    if (isSuspended !== undefined) {
      where.isSuspended = isSuspended;
    }
    if (q) {
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { profile: { firstName: { contains: q, mode: 'insensitive' } } },
        { profile: { lastName: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        isSuspended: true,
        createdAt: true,
        profile: {
          select: { firstName: true, lastName: true, avatarUrl: true, skills: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalUsers = await prisma.user.count({ where });

    return {
      users,
      totalUsers,
      page,
      limit,
      totalPages: Math.ceil(totalUsers / limit),
    };
  }

  public async updateUserStatus(userId: string, isSuspended: boolean, newRole?: UserRole) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    if (user.role === UserRole.ADMIN && user.id === userId) {
        throw new AppError('Cannot modify status or role of the super admin account via this endpoint.', 403);
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: isSuspended,
        role: newRole, // Only update if newRole is provided
      },
      select: { id: true, email: true, isSuspended: true, role: true },
    });
  }

  public async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    if (user.role === UserRole.ADMIN) {
      throw new AppError('Cannot delete an admin account.', 403);
    }

    // Prisma's onDelete: Cascade will handle related data (profile, tasks, bids, etc.)
    await prisma.user.delete({ where: { id: userId } });
  }
  public async getTransactionsForTask(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    });
    if (!task) {
      throw new AppError('Task not found.', 404);
    }

    return prisma.transaction.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, email: true, role: true } },
        milestone: { select: { id: true, description: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
  
}

export default new AdminService();