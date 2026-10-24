import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { AppError } from '../middleware/errorHandler.js';

export class UserController {
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          timezone: true,
          bio: true,
          emailVerified: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new AppError('User not found.', 404, 'NOT_FOUND');
      }

      // Aggregate counts for quick dashboard stats
      const [plansCount, tasksCount, completedTasksCount, spacesCount, savedItemsCount] = await Promise.all([
        prisma.plan.count({ where: { userId } }),
        prisma.task.count({ where: { userId } }),
        prisma.task.count({ where: { userId, status: 'DONE' } }),
        prisma.sharedSpaceMember.count({ where: { userId } }),
        prisma.savedItem.count({ where: { userId, isArchived: false } }),
      ]);

      res.json({
        success: true,
        data: {
          user,
          stats: {
            plansCount,
            tasksCount,
            completedTasksCount,
            spacesCount,
            savedItemsCount,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { fullName, bio, avatarUrl, timezone } = req.body;

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(fullName !== undefined && { fullName }),
          ...(bio !== undefined && { bio }),
          ...(avatarUrl !== undefined && { avatarUrl }),
          ...(timezone !== undefined && { timezone }),
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

      res.json({
        success: true,
        data: { user: updated },
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword || newPassword.length < 8) {
        throw new AppError('Current password and new password (min 8 chars) are required.', 400, 'INVALID_INPUT');
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new AppError('User not found.', 404);

      const isMatch = await comparePassword(currentPassword, user.passwordHash);
      if (!isMatch) {
        throw new AppError('Current password is incorrect.', 400, 'INVALID_CURRENT_PASSWORD');
      }

      const passwordHash = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      });

      res.json({
        success: true,
        message: 'Password updated successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async exportData(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const [user, plans, tasks, spaces, savedItems, aiHistory] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, fullName: true, createdAt: true },
        }),
        prisma.plan.findMany({
          where: { userId },
          include: { tasks: true, budget: { include: { expenses: true } } },
        }),
        prisma.task.findMany({
          where: { userId },
          include: { subtasks: true },
        }),
        prisma.sharedSpaceMember.findMany({
          where: { userId },
          include: { space: true },
        }),
        prisma.savedItem.findMany({
          where: { userId },
        }),
        prisma.aIConversation.findMany({
          where: { userId },
          include: { messages: true },
        }),
      ]);

      const exportPayload = {
        exportedAt: new Date().toISOString(),
        user,
        plans,
        tasks,
        spaces: spaces.map(s => ({ ...s.space, role: s.role })),
        savedItems,
        aiHistory,
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="nexa-export-${userId}.json"`);
      res.json(exportPayload);
    } catch (error) {
      next(error);
    }
  }

  static async deleteMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      // Cascade delete handles all related tables
      await prisma.user.delete({
        where: { id: userId },
      });

      res.json({
        success: true,
        message: 'Account and associated personal data deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}
