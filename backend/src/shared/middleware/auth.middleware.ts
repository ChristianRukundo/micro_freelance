import { Request, Response, NextFunction } from 'express';
import config from '@config/index';
import AppError from '@shared/utils/appError';
import { verifyToken } from '@shared/utils/jwt';
import prisma from '@shared/database/prisma';
import { UserRole } from '@prisma/client';

export const protect = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    const decoded = verifyToken(token, config.JWT_SECRET);

    if (!decoded || typeof decoded === 'string' || !('id' in decoded)) {
      return next(new AppError('Invalid token.', 401));
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        isSuspended: true,
        stripeAccountId: true,
        stripeAccountCompleted: true,
      },
    });

    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    if (currentUser.isSuspended) {
      return next(new AppError('Your account has been suspended. Please contact support.', 403));
    }

    req.user = currentUser;
    next();
  } catch (error: any) {
    return next(new AppError('Invalid token or session expired. Please log in again.', 401));
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};
