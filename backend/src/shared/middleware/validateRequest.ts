import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import AppError from '@shared/utils/appError';

type RequestValidationSchemas = {
  body?: ZodObject<any, any>;
  query?: ZodObject<any, any>;
  params?: ZodObject<any, any>;
};

export const validateRequest =
  (schemas: RequestValidationSchemas) => async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as ParamsDictionary;
      }
      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as ParsedQs;
      }
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue: any) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));
        return next(new AppError(JSON.stringify(errorMessages), 400));
      }
      next(error);
    }
  };
