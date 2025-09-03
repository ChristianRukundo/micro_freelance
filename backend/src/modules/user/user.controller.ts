import { Request, Response, NextFunction } from 'express';
import userService from './user.service';
import { z } from 'zod';
import { ChangePasswordInput } from './user.validation';

const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name cannot be empty').optional(),
  lastName: z.string().min(1, 'Last name cannot be empty').optional(),
  avatarUrl: z.string().url('Avatar URL must be a valid URL').optional(),
  bio: z.string().optional(),
  skills: z.array(z.string().min(1)).optional(),
  portfolioLinks: z.array(z.string().url('Portfolio links must be valid URLs')).optional(),
});

type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

class UserController {
  public async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserProfile(req.user!.id);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  public async updateMe(req: Request<unknown, unknown, UpdateProfileInput>, res: Response, next: NextFunction) {
    try {
      const validatedData = updateProfileSchema.parse(req.body);
      const updatedProfile = await userService.updateMyProfile(req.user!.id, validatedData);
      res.status(200).json({ success: true, message: 'Profile updated successfully.', data: updatedProfile });
    } catch (error) {
      next(error);
    }
  }

  public async changePassword(req: Request<unknown, unknown, ChangePasswordInput>, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      await userService.changePassword(req.user!.id, currentPassword, newPassword);
      res.status(200).json({ success: true, message: 'Password changed successfully.' });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
