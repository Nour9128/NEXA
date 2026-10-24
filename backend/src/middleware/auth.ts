import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from './errorHandler.js';
import { prisma } from '../prisma.js';

export interface AuthUser {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication required. Missing token.', 401, 'UNAUTHORIZED'));
    }

    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Token has expired. Please refresh your session.', 401, 'TOKEN_EXPIRED'));
      }
      return next(new AppError('Invalid authentication token.', 401, 'INVALID_TOKEN'));
    }

    // Verify user exists and is not deleted
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return next(new AppError('User not found or account deactivated.', 401, 'USER_NOT_FOUND'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.userId, email: payload.email };
  } catch {
    // Ignore invalid token for optional auth
  }
  next();
}
