import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient, type User } from "@prisma/client";
import { AppError } from "../utils/appError";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface AuthenticatedRequest extends Request {
  user?: User;
}

export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError("You are not logged in. Please log in to get access", 401)
      );
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return next(
          new AppError("The user belonging to this token no longer exists", 401)
        );
      }

      (req as AuthenticatedRequest).user = user;
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new AppError("Invalid token. Please log in again", 401));
      }
      if (error instanceof jwt.TokenExpiredError) {
        return next(
          new AppError("Your token has expired. Please log in again", 401)
        );
      }
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const authenticatedReq = req as AuthenticatedRequest;
    if (!authenticatedReq.user) {
      return next(new AppError("You are not logged in", 401));
    }

    if (!roles.includes(authenticatedReq.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};
