/// <reference path="../types/express.d.ts" />
import type { Request, Response, NextFunction } from "express";
import { PrismaClient, type User } from "@prisma/client";
import { AppError } from "../utils/appError";

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: User;
}

export const getAllProperties = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      location,
      subLocation,
      guests,
      price,
      amenities,
      outdoor,
      activities,
      page = "1",
      limit = "9",
    } = req.query;

    const pageNumber = Number.parseInt(page as string);
    const limitNumber = Number.parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    const filter: any = { status: "active" };

    if (location) filter.location = location;
    if (subLocation) filter.subLocation = subLocation;
    if (guests) filter.guests = { gte: Number.parseInt(guests as string) };

    if (price) {
      const [min, max] = (price as string).split("-");
      if (min && max) {
        filter.pricePerNight = {
          gte: Number.parseFloat(min),
          lte: Number.parseFloat(max),
        };
      } else if (min) {
        filter.pricePerNight = { gte: Number.parseFloat(min) };
      }
    }

    if (amenities) {
      const amenitiesList = Array.isArray(amenities) ? amenities : [amenities];
      filter.amenities = {
        hasSome: amenitiesList,
      };
    }

    if (outdoor) {
      const outdoorList = Array.isArray(outdoor) ? outdoor : [outdoor];
      filter.outdoorFeatures = {
        hasSome: outdoorList,
      };
    }

    if (activities) {
      const activitiesList = Array.isArray(activities)
        ? activities
        : [activities];
      filter.activities = {
        hasSome: activitiesList,
      };
    }

    const properties = await prisma.property.findMany({
      where: filter,
      skip,
      take: limitNumber,
      orderBy: { createdAt: "desc" },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    let propertiesWithFavorites = properties.map((property) => ({
      ...property,
      isFavorite: false,
    }));
    if (req.user) {
      const favorites = await prisma.favorite.findMany({
        where: {
          userId: req.user.id,
          propertyId: {
            in: properties.map((p) => p.id),
          },
        },
      });

      const favoritePropertyIds = new Set(favorites.map((f) => f.propertyId));

      propertiesWithFavorites = properties.map((property) => ({
        ...property,
        isFavorite: favoritePropertyIds.has(property.id),
      }));
    }

    const totalProperties = await prisma.property.count({
      where: filter,
    });

    const totalPages = Math.ceil(totalProperties / limitNumber);

    res.status(200).json({
      status: "success",
      data: {
        properties: propertiesWithFavorites,
        totalPages,
        currentPage: pageNumber,
        totalProperties,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPropertyById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!property) {
      return next(new AppError("Property not found", 404));
    }

    let isFavorite = false;
    if (req.user) {
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_propertyId: {
            userId: req.user.id,
            propertyId: id,
          },
        },
      });
      isFavorite = !!favorite;
    }

    res.status(200).json({
      status: "success",
      data: {
        ...property,
        isFavorite,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProperties = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const featuredProperties = await prisma.property.findMany({
      where: { status: "active" },
      take: 3,
      orderBy: [
        {
          bookings: {
            _count: "desc",
          },
        },
        {
          createdAt: "desc",
        },
      ],
      include: {
        agent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    let propertiesWithFavorites = featuredProperties.map((property) => ({
      ...property,
      isFavorite: false,
    }));
    if (req.user) {
      const favorites = await prisma.favorite.findMany({
        where: {
          userId: req.user.id,
          propertyId: {
            in: featuredProperties.map((p) => p.id),
          },
        },
      });

      const favoritePropertyIds = new Set(favorites.map((f) => f.propertyId));

      propertiesWithFavorites = featuredProperties.map((property) => ({
        ...property,
        isFavorite: favoritePropertyIds.has(property.id),
      }));
    }

    res.status(200).json({
      status: "success",
      data: propertiesWithFavorites,
    });
  } catch (error) {
    next(error);
  }
};

export const searchProperties = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query, page = "1", limit = "9" } = req.query;

    const pageNumber = Number.parseInt(page as string);
    const limitNumber = Number.parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    if (!query) {
      return next(new AppError("Search query is required", 400));
    }

    const properties = await prisma.property.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query as string,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query as string,
              mode: "insensitive",
            },
          },
          {
            location: {
              contains: query as string,
              mode: "insensitive",
            },
          },
          {
            subLocation: {
              contains: query as string,
              mode: "insensitive",
            },
          },
        ],
        AND: {
          status: "active",
        },
      },
      skip,
      take: limitNumber,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    let propertiesWithFavorites = properties.map((property) => ({
      ...property,
      isFavorite: false,
    }));
    if (req.user) {
      const favorites = await prisma.favorite.findMany({
        where: {
          userId: req.user.id,
          propertyId: {
            in: properties.map((p) => p.id),
          },
        },
      });

      const favoritePropertyIds = new Set(favorites.map((f) => f.propertyId));

      propertiesWithFavorites = properties.map((property) => ({
        ...property,
        isFavorite: favoritePropertyIds.has(property.id),
      }));
    }

    const totalProperties = await prisma.property.count({
      where: {
        OR: [
          {
            title: {
              contains: query as string,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query as string,
              mode: "insensitive",
            },
          },
          {
            location: {
              contains: query as string,
              mode: "insensitive",
            },
          },
          {
            subLocation: {
              contains: query as string,
              mode: "insensitive",
            },
          },
        ],
        AND: {
          status: "active",
        },
      },
    });

    const totalPages = Math.ceil(totalProperties / limitNumber);

    res.status(200).json({
      status: "success",
      data: {
        properties: propertiesWithFavorites,
        totalPages,
        currentPage: pageNumber,
        totalProperties,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPropertiesByAgent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { agentId } = req.params;
    const { page = "1", limit = "9" } = req.query;

    const pageNumber = Number.parseInt(page as string);
    const limitNumber = Number.parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    const properties = await prisma.property.findMany({
      where: {
        agentId,
        status: "active",
      },
      skip,
      take: limitNumber,
      orderBy: { createdAt: "desc" },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    let propertiesWithFavorites = properties.map((property) => ({
      ...property,
      isFavorite: false,
    }));
    if (req.user) {
      const favorites = await prisma.favorite.findMany({
        where: {
          userId: req.user.id,
          propertyId: {
            in: properties.map((p) => p.id),
          },
        },
      });

      const favoritePropertyIds = new Set(favorites.map((f) => f.propertyId));

      propertiesWithFavorites = properties.map((property) => ({
        ...property,
        isFavorite: favoritePropertyIds.has(property.id),
      }));
    }

    const totalProperties = await prisma.property.count({
      where: {
        agentId,
        status: "active",
      },
    });
    const totalPages = Math.ceil(totalProperties / limitNumber);

    res.status(200).json({
      status: "success",
      data: {
        properties: propertiesWithFavorites,
        totalPages,
        currentPage: pageNumber,
        totalProperties,
      },
    });
  } catch (error) {
    next(error);
  }
};
