import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";

const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("Error:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  if (err.name === "PrismaClientKnownRequestError") {
    return res.status(400).json({
      status: "error",
      message: "Database error occurred",
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "error",
      message: "Invalid token. Please log in again",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "error",
      message: "Your token has expired. Please log in again",
    });
  }

  return res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};

export default errorHandler;
