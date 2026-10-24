import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export class SavedItemController {
  static async getSavedItems(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { type, isFavorite, isArchived, search, tag } = req.query;

      const whereClause: any = { userId };

      if (type && typeof type === 'string' && type !== 'ALL') {
        whereClause.type = type;
      }

      if (isFavorite !== undefined) {
        whereClause.isFavorite = isFavorite === 'true';
      }

      if (isArchived !== undefined) {
        whereClause.isArchived = isArchived === 'true';
      } else {
        whereClause.isArchived = false; // Default to non-archived
      }

      if (tag && typeof tag === 'string') {
        whereClause.tags = { has: tag };
      }

      if (search && typeof search === 'string') {
        whereClause.AND = [
          {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { content: { contains: search, mode: 'insensitive' } },
              { aiSummary: { contains: search, mode: 'insensitive' } },
            ],
          },
        ];
      }

      const items = await prisma.savedItem.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createSavedItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { title, content, type, sourceUrl, mediaUrl, tags, aiSummary, isFavorite } = req.body;

      const item = await prisma.savedItem.create({
        data: {
          userId,
          title,
          content: content || null,
          type: type || 'NOTE',
          sourceUrl: sourceUrl || null,
          mediaUrl: mediaUrl || null,
          tags: tags || [],
          aiSummary: aiSummary || null,
          isFavorite: isFavorite || false,
        },
      });

      res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateSavedItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { title, content, tags, isFavorite, isArchived, aiSummary } = req.body;

      const existing = await prisma.savedItem.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId) {
        throw new AppError('Item not found.', 404);
      }

      const updated = await prisma.savedItem.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(content !== undefined && { content }),
          ...(tags !== undefined && { tags }),
          ...(isFavorite !== undefined && { isFavorite }),
          ...(isArchived !== undefined && { isArchived }),
          ...(aiSummary !== undefined && { aiSummary }),
        },
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSavedItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const existing = await prisma.savedItem.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId) {
        throw new AppError('Item not found.', 404);
      }

      await prisma.savedItem.delete({ where: { id } });

      res.json({
        success: true,
        message: 'Saved item deleted.',
      });
    } catch (error) {
      next(error);
    }
  }
}
