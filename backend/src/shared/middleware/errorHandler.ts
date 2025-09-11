import { Request, Response, NextFunction } from 'express';
import AppError from '@shared/utils/appError';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import logger from '@shared/utils/logger';

const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err };
  error.message = err.message;

  if (err instanceof ZodError) {
    const errorMessages = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    error = new AppError(`Validation Error: ${JSON.stringify(errorMessages)}`, 400);
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[])?.join(', ') || 'field';
      error = new AppError(`Duplicate field value: ${field}. Please use another value.`, 400);
    } else if (err.code === 'P2025') {
      error = new AppError(`Resource not found. ${err.meta?.cause}`, 404);
    } else {
      error = new AppError(`Database error: ${err.message}`, 500);
    }
  } else if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again!', 401);
  } else if (err.name === 'TokenExpiredError') {
    error = new AppError('Your token has expired! Please log in again.', 401);
  }

  logger.error(err.message, { stack: err.stack, name: err.name });

  res.status(error.statusCode).json({
    success: false,
    status: error.status,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
