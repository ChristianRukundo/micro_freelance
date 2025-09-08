import { TaskStatus, TransactionStatus, TransactionType } from '@prisma/client';
import prisma from '@shared/database/prisma';
import AppError from '@shared/utils/appError';
import { comparePasswords, hashPassword } from '@shared/utils/password'; 


interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  skills?: string[];
  portfolioLinks?: string[];
}

class UserService {
  public async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return user;
  }

  public async updateMyProfile(userId: string, data: UpdateProfileData) {
    const userProfile = await prisma.profile.findUnique({ where: { userId } });

    if (!userProfile) {
      throw new AppError('User profile not found.', 404);
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        avatarUrl: data.avatarUrl,
        bio: data.bio,
        skills: data.skills,
        portfolioLinks: data.portfolioLinks,
      },
    });

    return updatedProfile;
  }
  public async changePassword(userId: string, currentPasswordPlain: string, newPasswordPlain: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const isMatch = await comparePasswords(currentPasswordPlain, user.password);
    if (!isMatch) {
      throw new AppError('Incorrect current password.', 401);
    }

    const newHashedPassword = await hashPassword(newPasswordPlain);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: newHashedPassword,
      },
    });
  }


    public async getClientDashboardStats(clientId: string) {
    const totalProjects = await prisma.task.count({ where: { clientId } });
    const activeProjects = await prisma.task.count({
      where: {
        clientId,
        status: { in: [TaskStatus.OPEN, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW] },
      },
    });
    const completedProjects = await prisma.task.count({ where: { clientId, status: TaskStatus.COMPLETED } });

    const totalSpendingResult = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId: clientId,
        status: TransactionStatus.SUCCEEDED,
        type: { in: [TransactionType.ESCROW_FUNDING, TransactionType.ESCROW_RELEASE, TransactionType.PLATFORM_FEE] },
      },
    });
    const totalSpending = totalSpendingResult._sum.amount || 0;

    const recentProjects = await prisma.task.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        budget: true,
        createdAt: true,
        freelancer: { select: { id: true, profile: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
      },
    });

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalSpending,
      recentProjects,
    };
  }

  // ADDED: Get dashboard statistics for Freelancer
  public async getFreelancerDashboardStats(freelancerId: string) {
    const totalAssignedProjects = await prisma.task.count({ where: { freelancerId } });
    const activeProjects = await prisma.task.count({
      where: {
        freelancerId,
        status: { in: [TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW] },
      },
    });
    const completedProjects = await prisma.task.count({ where: { freelancerId, status: TaskStatus.COMPLETED } });

    const totalEarningsResult = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId: freelancerId,
        status: TransactionStatus.SUCCEEDED,
        type: TransactionType.PAYOUT,
      },
    });
    const totalEarnings = totalEarningsResult._sum.amount || 0;

    const recentProjects = await prisma.task.findMany({
      where: { freelancerId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        budget: true,
        updatedAt: true,
        client: { select: { id: true, profile: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
      },
    });

    // Dummy earnings data for chart
    const earningsByMonth = [
      { month: 'Jan', earnings: Math.floor(Math.random() * 500) + 100 },
      { month: 'Feb', earnings: Math.floor(Math.random() * 700) + 200 },
      { month: 'Mar', earnings: Math.floor(Math.random() * 600) + 150 },
      { month: 'Apr', earnings: Math.floor(Math.random() * 800) + 300 },
      { month: 'May', earnings: Math.floor(Math.random() * 900) + 400 },
      { month: 'Jun', earnings: Math.floor(Math.random() * 1200) + 500 },
    ];


    return {
      totalAssignedProjects,
      activeProjects,
      completedProjects,
      totalEarnings,
      recentProjects,
      earningsByMonth,
    };
  }
}





export default new UserService();