import { Request, Response, NextFunction } from 'express';
import authService from './auth.service';
import { createSendToken, clearAuthCookies } from '@shared/utils/jwt';
import {
  RegisterInput,
  VerifyEmailInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './auth.validation';
import AppError from '@shared/utils/appError';
import { UserRole } from '@prisma/client';

class AuthController {
  public async register(req: Request<unknown, unknown, RegisterInput>, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName, role } = req.body;
      const user = await authService.register(email, password, firstName, lastName, role as UserRole);
      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: { userId: user.id, email: user.email },
      });
    } catch (error) {
      next(error);
    }
  }

  public async verifyEmail(req: Request<unknown, unknown, VerifyEmailInput>, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      await authService.verifyEmail(email, otp);
      res.status(200).json({ success: true, message: 'Email verified successfully!' });
    } catch (error) {
      next(error);
    }
  }

  public async resendVerificationEmail(
    req: Request<unknown, unknown, { email: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { email } = req.body;
      await authService.resendVerificationEmail(email);
      res.status(200).json({ success: true, message: 'New verification OTP sent to your email.' });
    } catch (error) {
      next(error);
    }
  }

  public async login(req: Request<unknown, unknown, LoginInput>, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const user = await authService.login(email, password);
      createSendToken(user, 200, res);
    } catch (error) {
      next(error);
    }
  }

  public async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      clearAuthCookies(res);
      res.status(200).json({ success: true, message: 'Logged out successfully.' });
    } catch (error) {
      next(error);
    }
  }

  public async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return next(new AppError('No refresh token provided. Please log in.', 401));
      }

      const decoded = await authService.verifyRefreshToken(refreshToken);

      if (!decoded || typeof decoded === 'string' || !('id' in decoded)) {
        return next(new AppError('Invalid refresh token.', 401));
      }

      const user = await authService.getCurrentUser(decoded.id);

      if (!user) {
        return next(new AppError('User not found.', 404));
      }

      createSendToken(user, 200, res); // This will issue a new access token
    } catch (error) {
      clearAuthCookies(res); // Clear cookies on refresh token failure
      next(error);
    }
  }

  public async forgotPassword(req: Request<unknown, unknown, ForgotPasswordInput>, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset OTP has been sent.',
      });
    } catch (error) {
      next(error);
    }
  }

  public async resetPassword(req: Request<unknown, unknown, ResetPasswordInput>, res: Response, next: NextFunction) {
    try {
      const { email, otp, newPassword } = req.body;
      await authService.resetPassword(email, otp, newPassword);
      res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
