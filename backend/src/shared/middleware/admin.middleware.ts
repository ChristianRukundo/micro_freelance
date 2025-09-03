import { Request, Response, NextFunction } from 'express';
import AppError from '@shared/utils/appError';
import { UserRole } from '@prisma/client';

export const adminProtect = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    return next(new AppError('Access denied. Admin privileges required.', 403));
  }
  next();
};