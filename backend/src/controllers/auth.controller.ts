import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../prisma.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, fullName, timezone } = req.body;

      const existing = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existing) {
        throw new AppError('An account with this email already exists.', 409, 'EMAIL_EXISTS');
      }

      const passwordHash = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          fullName,
          timezone: timezone || 'UTC',
          emailVerified: true, // Auto-verify for streamlined user onboarding
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          timezone: true,
          bio: true,
          createdAt: true,
        },
      });

      const accessToken = generateAccessToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

      // Save session in DB
      await prisma.session.create({
        data: {
          userId: user.id,
          refreshToken,
          userAgent: req.headers['user-agent'] || null,
          ipAddress: req.ip || null,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Create a welcoming in-app notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'SYSTEM',
          title: 'Welcome to NEXA!',
          message: 'Your personal intelligence platform is ready. Try creating a plan or capturing your first idea.',
          link: '/app',
        },
      });

      res.status(201).json({
        success: true,
        data: {
          user,
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
      }

      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
      }

      const accessToken = generateAccessToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

      // Save session
      await prisma.session.create({
        data: {
          userId: user.id,
          refreshToken,
          userAgent: req.headers['user-agent'] || null,
          ipAddress: req.ip || null,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
            timezone: user.timezone,
            bio: user.bio,
            createdAt: user.createdAt,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new AppError('Refresh token is required.', 400, 'MISSING_TOKEN');
      }

      let payload;
      try {
        payload = verifyRefreshToken(refreshToken);
      } catch {
        throw new AppError('Invalid or expired refresh token.', 401, 'INVALID_REFRESH_TOKEN');
      }

      const session = await prisma.session.findUnique({
        where: { refreshToken },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new AppError('Session expired. Please log in again.', 401, 'SESSION_EXPIRED');
      }

      const newAccessToken = generateAccessToken({ userId: payload.userId, email: payload.email });

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await prisma.session.deleteMany({
          where: { refreshToken },
        });
      }
      res.json({
        success: true,
        message: 'Logged out successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        // Return success to avoid email enumeration
        return res.json({
          success: true,
          message: 'If an account exists with that email, a password reset link has been issued.',
        });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt,
        },
      });

      res.json({
        success: true,
        message: 'Password reset link generated.',
        // Expose token in non-production for easy testing
        resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;

      const record = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!record || record.expiresAt < new Date()) {
        throw new AppError('Invalid or expired reset token.', 400, 'INVALID_RESET_TOKEN');
      }

      const passwordHash = await hashPassword(newPassword);

      await prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      });

      // Invalidate token and all existing sessions
      await prisma.passwordResetToken.delete({ where: { id: record.id } });
      await prisma.session.deleteMany({ where: { userId: record.userId } });

      res.json({
        success: true,
        message: 'Password has been reset successfully. You can now log in with your new password.',
      });
    } catch (error) {
      next(error);
    }
  }
}
