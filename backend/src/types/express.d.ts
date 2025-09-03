import { Request } from "express";
import { User } from "./user";

declare module "express" {
  export interface Request {
    user?: User;
  }
}

export interface AuthenticatedRequest extends Request {}
