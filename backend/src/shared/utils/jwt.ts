import jwt, { JwtPayload as JsonWebTokenPayload, SignOptions } from 'jsonwebtoken';
import config from '@config/index';
import { UserRole } from '@prisma/client';
import { Response } from 'express';

interface JwtPayload extends JsonWebTokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * Signs a JWT token with the given payload and options.
 *
 * @param id - The user ID.
 * @param email - The user email.
 * @param role - The user role.
 * @param secret - The secret key for signing the token.
 * @param expiresIn - The expiration time for the token (e.g., "15m", "7d").
 * @returns The signed JWT string.
 */
export const signToken = (id: string, email: string, role: UserRole, secret: string, expiresIn: string): string => {
  const payload: JwtPayload = { id, email, role };

  const options: SignOptions = { expiresIn: expiresIn as SignOptions['expiresIn'] };
  return jwt.sign(payload, secret, options);
};

/**
 * Creates and sends authentication tokens (access and refresh) to the client.
 * Sets them as HTTP-only cookies and sends user data in the response body.
 *
 * @param user - The user object containing id, email, and role.
 * @param statusCode - The HTTP status code for the response.
 * @param res - The Express response object.
 */
export const createSendToken = (
  user: { id: string; email: string; role: UserRole },
  statusCode: number,
  res: Response,
) => {
  const accessToken = signToken(user.id, user.email, user.role, config.JWT_SECRET, config.ACCESS_TOKEN_EXPIRATION);

  const refreshToken = signToken(
    user.id,
    user.email,
    user.role,
    config.JWT_REFRESH_SECRET,
    config.REFRESH_TOKEN_EXPIRATION,
  );

  const accessTokenCookieExpirationMs = 15 * 60 * 1000;
  const refreshTokenCookieExpirationMs = 7 * 24 * 60 * 60 * 1000;

  const cookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  };

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: refreshTokenCookieExpirationMs,
  });

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: accessTokenCookieExpirationMs,
  });

  res.status(statusCode).json({
    success: true,
    message: 'Authentication successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    },
  });
};

/**
 * Verifies a JWT token and returns the decoded payload or an error message string.
 *
 * @param token - The JWT string to verify.
 * @param secret - The secret key used for verification.
 * @returns The decoded JwtPayload object or a string containing an error message.
 */
export const verifyToken = (token: string, secret: string): JwtPayload | string => {
  try {
    const decoded = jwt.verify(token, secret);

    if (typeof decoded === 'string') {
      return decoded;
    }

    return decoded as JwtPayload;
  } catch (error: any) {
    return error.message;
  }
};

/**
 * Clears authentication cookies by setting their expiration to a past date.
 *
 * @param res - The Express response object.
 */
export const clearAuthCookies = (res: Response) => {
  res.cookie('accessToken', 'loggedout', {
    expires: new Date(Date.now() - 1000),
    httpOnly: true,
  });
  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() - 1000),
    httpOnly: true,
  });
};
