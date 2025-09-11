import jwt, { JwtPayload as JsonWebTokenPayload, SignOptions } from 'jsonwebtoken';
import config from '@config/index';
import { UserRole } from '@prisma/client';
import { Response } from 'express';

interface JwtPayload extends JsonWebTokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

interface UserWithProfileData {
  id: string;
  email: string;
  role: UserRole;
  profile: {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  } | null;
}

/**
 * Signs a JWT token with the given payload and options.
 */
export const signToken = (id: string, email: string, role: UserRole, secret: string, expiresIn: string): string => {
  const payload: JwtPayload = { id, email, role };
  const options: SignOptions = { expiresIn: expiresIn as SignOptions['expiresIn'] };
  return jwt.sign(payload, secret, options);
};


const getCookieOptions = (): any => {
  const isProduction = config.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax', 
    domain: config.COOKIE_DOMAIN || undefined, 
  };
};


/**
 * Creates and sends authentication tokens (access and refresh) to the client.
 */
export const createSendToken = (user: UserWithProfileData, statusCode: number, res: Response) => {
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

  const cookieOptions = getCookieOptions();

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

        profile: user.profile,
      },
    },
  });
};

/**
 * Verifies a JWT token.
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
 * Clears authentication cookies.
 */
export const clearAuthCookies = (res: Response) => {
  const cookieOptions: any = {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: config.COOKIE_DOMAIN,
  };

  res.cookie('accessToken', 'loggedout', {
    ...cookieOptions,
    expires: new Date(Date.now() - 10000),
  });
  res.cookie('refreshToken', 'loggedout', {
    ...cookieOptions,
    expires: new Date(Date.now() - 10000),
  });
};