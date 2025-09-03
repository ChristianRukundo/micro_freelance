import type { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../utils/appError";
import { User } from "@prisma/client";

const prisma = new PrismaClient();

export const getAgentStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const agent = req.user as User;

    const totalProperties = await prisma.property.count({
      where: { agentId: agent.id },
    });
    const totalBookings = await prisma.booking.count({
      where: { property: { agentId: agent.id } },
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newPropertiesThisMonth = await prisma.property.count({
      where: {
        agentId: agent.id,
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    const newBookingsThisMonth = await prisma.booking.count({
      where: {
        property: { agentId: agent.id },
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    const bookings = await prisma.booking.findMany({
      where: { property: { agentId: agent.id } },
    });
    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + booking.totalAmount,
      0
    );

    const bookingsThisMonth = await prisma.booking.findMany({
      where: {
        property: { agentId: agent.id },
        createdAt: {
          gte: startOfMonth,
        },
      },
    });
    const revenueThisMonth = bookingsThisMonth.reduce(
      (sum, booking) => sum + booking.totalAmount,
      0
    );

    const topProperties = await prisma.property.findMany({
      take: 5,
      where: { agentId: agent.id },
      orderBy: {
        bookings: {
          _count: "desc",
        },
      },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    const properties = await prisma.property.findMany({
      where: { agentId: agent.id },
      select: {
        location: true,
      },
    });

    const locationCounts: Record<string, number> = {};
    properties.forEach((property) => {
      locationCounts[property.location] =
        (locationCounts[property.location] || 0) + 1;
    });

    const topLocations = Object.entries(locationCounts)
      .map(([name, properties]) => ({ name, properties }))
      .sort((a, b) => b.properties - a.properties)
      .slice(0, 5);

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentMonth = new Date().getMonth();

    const revenueData = months.map((month, index) => ({
      name: month,
      value:
        index <= currentMonth ? Math.floor(Math.random() * 5000) + 2500 : 0,
    }));

    const bookingsData = months.map((month, index) => ({
      name: month,
      value: index <= currentMonth ? Math.floor(Math.random() * 25) + 5 : 0,
    }));

    const totalUsers = await prisma.user.count();
    const usersWithBookingsOnAgentProperties = await prisma.user.count({
      where: {
        bookings: {
          some: {
            property: {
              agentId: agent.id,
            },
          },
        },
      },
    });

    const userData = [
      {
        name: "Users with Bookings",
        value: usersWithBookingsOnAgentProperties,
      },
      {
        name: "Other Users",
        value: totalUsers - usersWithBookingsOnAgentProperties - 1,
      },
    ];

    res.status(200).json({
      status: "success",
      data: {
        totalProperties,
        newPropertiesThisMonth,
        totalBookings,
        newBookingsThisMonth,
        totalRevenue,
        revenueThisMonth,
        topProperties: topProperties.map((p) => ({
          id: p.id,
          title: p.title,
          bookings: p._count.bookings,
        })),
        topLocations,
        revenueData,
        bookingsData,
        userData,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAgentProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const agent = req.user as User;
    const properties = await prisma.property.findMany({
      where: {
        agentId: agent.id,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

export const getAgentBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const agent = req.user as User;
    const bookings = await prisma.booking.findMany({
      where: {
        property: {
          agentId: agent.id,
        },
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            pricePerNight: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getAgentUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const bookingsCount = await prisma.booking.count({
          where: {
            userId: user.id,
            property: {
              agentId: (req.user as User).id,
            },
          },
        });

        const favoritesCount = await prisma.favorite.count({
          where: {
            userId: user.id,
            property: {
              agentId: (req.user as User).id,
            },
          },
        });

        const bookings = await prisma.booking.findMany({
          where: {
            userId: user.id,
            property: {
              agentId: (req.user as User).id,
            },
          },
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            property: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        });

        return {
          ...user,
          bookingsCount,
          favoritesCount,
          bookings,
        };
      })
    );

    res.status(200).json({
      status: "success",
      data: usersWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

export const createProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const agent = req.user as User;
    const {
      title,
      description,
      location,
      subLocation,
      pricePerNight,
      guests,
      bedrooms,
      bathrooms,
      squareMeters,
      images,
      amenities,
      outdoorFeatures,
      activities,
      coordinates,
    } = req.body;

    if (
      !title ||
      !description ||
      !location ||
      !pricePerNight ||
      !guests ||
      !bedrooms ||
      !bathrooms
    ) {
      return next(new AppError("Missing required fields", 400));
    }

    const property = await prisma.property.create({
      data: {
        title,
        description,
        location,
        subLocation: subLocation || null,
        pricePerNight: Number(pricePerNight),
        guests: Number(guests),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        squareMeters: Number(squareMeters),
        images: images || [],
        amenities: amenities || [],
        outdoorFeatures: outdoorFeatures || [],
        activities: activities || [],
        coordinates: coordinates || null,
        status: "active",
        agentId: agent.id,
      },
    });

    res.status(201).json({
      status: "success",
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const agent = req.user as User;
    const {
      title,
      description,
      location,
      subLocation,
      pricePerNight,
      guests,
      bedrooms,
      bathrooms,
      squareMeters,
      images,
      amenities,
      outdoorFeatures,
      activities,
      coordinates,
      status,
    } = req.body;

    const property = await prisma.property.findUnique({
      where: {
        id,
        agentId: agent.id,
      },
    });

    if (!property) {
      return next(
        new AppError("Property not found or you are not the owner", 404)
      );
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        location: location !== undefined ? location : undefined,
        subLocation: subLocation !== undefined ? subLocation : undefined,
        pricePerNight:
          pricePerNight !== undefined ? Number(pricePerNight) : undefined,
        guests: guests !== undefined ? Number(guests) : undefined,
        bedrooms: bedrooms !== undefined ? Number(bedrooms) : undefined,
        bathrooms: bathrooms !== undefined ? Number(bathrooms) : undefined,
        squareMeters:
          squareMeters !== undefined ? Number(squareMeters) : undefined,
        images: images !== undefined ? images : undefined,
        amenities: amenities !== undefined ? amenities : undefined,
        outdoorFeatures:
          outdoorFeatures !== undefined ? outdoorFeatures : undefined,
        activities: activities !== undefined ? activities : undefined,
        coordinates: coordinates !== undefined ? coordinates : undefined,
        status: status !== undefined ? status : undefined,
      },
    });

    res.status(200).json({
      status: "success",
      data: updatedProperty,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const agent = req.user as User;

    const property = await prisma.property.findUnique({
      where: {
        id,
        agentId: agent.id,
      },
    });

    if (!property) {
      return next(
        new AppError("Property not found or you are not the owner", 404)
      );
    }

    const bookings = await prisma.booking.findMany({
      where: { propertyId: id },
    });

    if (bookings.length > 0) {
      await prisma.property.update({
        where: { id },
        data: { status: "inactive" },
      });

      return res.status(200).json({
        status: "success",
        message: "Property marked as inactive as it has associated bookings",
      });
    }

    await prisma.property.delete({
      where: { id },
    });

    res.status(200).json({
      status: "success",
      message: "Property deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return next(new AppError("Role is required", 400));
    }

    if (role !== "USER" && role !== "AGENT") {
      return next(new AppError("Invalid role", 400));
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
    });

    const { password, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      status: "success",
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (
  next: NextFunction
) => {
  return next();
};
