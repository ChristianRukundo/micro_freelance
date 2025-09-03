import { Request, Response, NextFunction } from 'express';
import adminService from './admin.service';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { taskIdParamSchema } from '@modules/bids/bid.validation';

const userIdParamSchema = z.object({
  userId: z.string().cuid('Invalid user ID format'),
});

const getAllUsersQuerySchema = z.object({
  page: z.preprocess(Number, z.number().int().positive().default(1)).optional(),
  limit: z.preprocess(Number, z.number().int().positive().max(100).default(10)).optional(),
  role: z.enum(UserRole).optional(),
  isSuspended: z.preprocess(
    (val) => (val === 'true' ? true : val === 'false' ? false : undefined),
    z.boolean().optional(),
  ),
  q: z.string().optional(),
});

const updateUserStatusSchema = z.object({
  isSuspended: z.boolean({
    error: (issue) =>
      issue.input === undefined ? "isSuspended is required" : "isSuspended must be a boolean",
  }),
  role: z
    .enum(["CLIENT", "FREELANCER", "ADMIN"], {
      error: "Invalid user role specified",
    })
    .optional(),
});
class AdminController {
  public async getAllUsers(
    req: Request<unknown, unknown, unknown, z.infer<typeof getAllUsersQuerySchema>>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { page, limit, role, isSuspended, q } = req.query;
      const usersData = await adminService.getAllUsers(page, limit, role, isSuspended, q);
      res.status(200).json({ success: true, data: usersData });
    } catch (error) {
      next(error);
    }
  }

  public async updateUserStatus(
    req: Request<z.infer<typeof userIdParamSchema>, unknown, z.infer<typeof updateUserStatusSchema>>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { userId } = req.params;
      const { isSuspended, role } = req.body;
      const updatedUser = await adminService.updateUserStatus(userId, isSuspended, role);
      res.status(200).json({ success: true, message: 'User status updated successfully.', data: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  public async deleteUser(req: Request<z.infer<typeof userIdParamSchema>>, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      await adminService.deleteUser(userId);
      res.status(204).json({ success: true, message: 'User deleted successfully.' }); // 204 No Content
    } catch (error) {
      next(error);
    }
  }

  public async getTransactionsForTask(
    req: Request<z.infer<typeof taskIdParamSchema>>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { taskId } = req.params;
      const transactions = await adminService.getTransactionsForTask(taskId);
      res.status(200).json({ success: true, data: transactions });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
