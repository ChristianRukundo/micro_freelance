/// <reference path="../types/express.d.ts" />
import type { Request, Response, NextFunction } from "express";
import { PrismaClient, type User } from "@prisma/client";
import { AppError } from "../utils/appError";

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: User;
}

export const toggleFavorite = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { propertyId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError("User not authenticated", 401));
    }

    if (!propertyId) {
      return next(new AppError("Property ID is required", 400));
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return next(new AppError("Property not found", 404));
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: {
          userId_propertyId: {
            userId,
            propertyId,
          },
        },
      });

      return res.status(200).json({
        status: "success",
        message: "Removed from favorites",
        isFavorite: false,
      });
    }

    await prisma.favorite.create({
      data: {
        userId,
        propertyId,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Added to favorites",
      isFavorite: true,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllFavorites = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError("User not authenticated", 401));
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { property: true },
    });

    const properties = favorites.map((favorite) => ({
      ...favorite.property,
      isFavorite: true,
    }));

    res.status(200).json({
      status: "success",
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};
