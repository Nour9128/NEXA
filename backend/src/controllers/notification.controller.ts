import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';

export class NotificationController {
  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const [notifications, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        prisma.notification.count({
          where: { userId, isRead: false },
        }),
      ]);

      res.json({
        success: true,
        data: {
          notifications,
          unreadCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      if (id === 'all') {
        await prisma.notification.updateMany({
          where: { userId, isRead: false },
          data: { isRead: true },
        });
      } else {
        await prisma.notification.updateMany({
          where: { id, userId },
          data: { isRead: true },
        });
      }

      res.json({
        success: true,
        message: 'Notification marked as read.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await prisma.notification.deleteMany({
        where: { id, userId },
      });

      res.json({
        success: true,
        message: 'Notification deleted.',
      });
    } catch (error) {
      next(error);
    }
  }
}
