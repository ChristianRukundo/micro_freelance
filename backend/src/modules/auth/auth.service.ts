import { Profile, User, UserRole } from '@prisma/client';
import prisma from '@shared/database/prisma';
import { hashPassword, comparePasswords } from '@shared/utils/password';
import { generateOTP } from '@shared/utils/otp';
import AppError from '@shared/utils/appError';
import nodemailerService from '@shared/services/email/nodemailer.service';
import { OTP_EXPIRY_MINUTES } from '@shared/constants';
import { createNotification } from '@modules/notifications/notification.service';
import { NotificationType } from '@prisma/client';
import { verifyToken } from '@shared/utils/jwt';
import config from '@config/index';

type UserWithProfile = User & { profile: Profile | null };

class AuthService {
  public async register(
    email: string,
    passwordPlain: string,
    firstName: string,
    lastName: string,
    role: UserRole,
  ): Promise<User> {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('User with this email already exists.', 409);
    }

    const hashedPassword = await hashPassword(passwordPlain);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        emailVerificationOTP: otp,
        otpExpires,
        profile: {
          create: {
            firstName,
            lastName,
          },
        },
      },
    });

    await nodemailerService.sendVerificationEmail(newUser.email, firstName, otp);

    return newUser;
  }

  public async verifyEmail(email: string, otp: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new AppError('User not found.', 404);
    }
    if (user.emailVerified) {
      throw new AppError('Email already verified.', 400);
    }
    if (!user.emailVerificationOTP || user.emailVerificationOTP !== otp) {
      throw new AppError('Invalid OTP.', 400);
    }
    if (!user.otpExpires || user.otpExpires < new Date()) {
      throw new AppError('OTP expired.', 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationOTP: null,
        otpExpires: null,
      },
    });

    await createNotification(
      user.id,
      NotificationType.EMAIL_VERIFIED,
      'Your email has been successfully verified!',
      '/dashboard',
    );
  }

  public async resendVerificationEmail(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: { select: { firstName: true } } },
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }
    if (user.emailVerified) {
      throw new AppError('Email already verified.', 400);
    }

    const newOtp = generateOTP();
    const newOtpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationOTP: newOtp,
        otpExpires: newOtpExpires,
      },
    });

    await nodemailerService.sendVerificationEmail(user.email, user.profile?.firstName || user.email, newOtp);
  }

  public async login(email: string, passwordPlain: string): Promise<UserWithProfile> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });

    if (!user || !(await comparePasswords(passwordPlain, user.password))) {
      throw new AppError('Incorrect email or password.', 401);
    }
    if (!user.emailVerified) {
      throw new AppError('Please verify your email address before logging in.', 403);
    }
    if (user.isSuspended) {
      throw new AppError('Your account has been suspended. Please contact support.', 403);
    }

    return user;
  }

  public async verifyRefreshToken(token: string) {
    try {
      return verifyToken(token, config.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new AppError('Invalid or expired refresh token. Please log in again.', 401);
    }
  }

  public async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: { select: { firstName: true } } },
    });

    if (!user) {
      return;
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetOTP: otp,
        otpExpires,
      },
    });

    await nodemailerService.sendPasswordResetEmail(user.email, user.profile?.firstName || user.email, otp);
  }

  public async resetPassword(email: string, otp: string, newPasswordPlain: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new AppError('User not found.', 404);
    }
    if (!user.passwordResetOTP || user.passwordResetOTP !== otp) {
      throw new AppError('Invalid OTP.', 400);
    }
    if (!user.otpExpires || user.otpExpires < new Date()) {
      throw new AppError('OTP expired.', 400);
    }

    const newHashedPassword = await hashPassword(newPasswordPlain);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: newHashedPassword,
        passwordResetOTP: null,
        otpExpires: null,
      },
    });

    await createNotification(
      user.id,
      NotificationType.PASSWORD_RESET,
      'Your password has been successfully reset!',
      '/dashboard',
    );
  }

  public async getCurrentUser(userId: string): Promise<UserWithProfile | null> {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });
  }
}

export default new AuthService();
