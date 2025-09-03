import type {  Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../utils/appError";

import { AuthenticatedRequest } from "../types/express";

const prisma = new PrismaClient();

export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      propertyId,
      checkIn,
      checkOut,
      guests,
      totalAmount,
      cleaningFee,
      serviceFee,
    } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError("User not authenticated", 401));
    }

    if (!propertyId || !checkIn || !checkOut || !guests || !totalAmount) {
      return next(new AppError("Missing required fields", 400));
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return next(new AppError("Property not found", 404));
    }

    const existingBooking = await prisma.booking.findFirst({
      where: {
        propertyId,
        OR: [
          {
            AND: [
              { checkIn: { lte: new Date(checkIn) } },
              { checkOut: { gte: new Date(checkIn) } },
            ],
          },
          {
            AND: [
              { checkIn: { lte: new Date(checkOut) } },
              { checkOut: { gte: new Date(checkOut) } },
            ],
          },
          {
            AND: [
              { checkIn: { gte: new Date(checkIn) } },
              { checkOut: { lte: new Date(checkOut) } },
            ],
          },
        ],
        status: { in: ["pending", "confirmed"] },
      },
    });

    if (existingBooking) {
      return next(
        new AppError("Property is not available for the selected dates", 400)
      );
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        propertyId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests,
        totalAmount,
        cleaningFee: cleaningFee || 130,
        serviceFee: serviceFee || Math.round(totalAmount * 0.15),
        status: "pending",
      },
    });

    res.status(201).json({
      status: "success",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError("User not authenticated", 401));
    }

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        property: true,
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

export const getBookingById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError("User not authenticated", 401));
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        property: true,
      },
    });

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    if (booking.userId !== userId && req.user?.role !== "AGENT") {
      return next(
        new AppError("You are not authorized to access this booking", 403)
      );
    }

    res.status(200).json({
      status: "success",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError("User not authenticated", 401));
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    if (booking.userId !== userId && req.user?.role !== "AGENT") {
      return next(
        new AppError("You are not authorized to cancel this booking", 403)
      );
    }

    if (booking.status === "cancelled" || booking.status === "completed") {
      return next(
        new AppError(
          `Booking cannot be cancelled as it is already ${booking.status}`,
          400
        )
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: "cancelled" },
    });

    res.status(200).json({
      status: "success",
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return next(new AppError("Status is required", 400));
    }

    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      return next(new AppError("Invalid status", 400));
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    res.status(200).json({
      status: "success",
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};
