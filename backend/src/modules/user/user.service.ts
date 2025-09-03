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

}

export default new UserService();