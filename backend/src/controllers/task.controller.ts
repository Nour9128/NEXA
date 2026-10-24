import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export class TaskController {
  static async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { status, priority, planId, spaceId, search, filter } = req.query;

      // Also include tasks assigned to user or in user's shared spaces
      const userSpaces = await prisma.sharedSpaceMember.findMany({
        where: { userId },
        select: { spaceId: true },
      });
      const spaceIds = userSpaces.map(s => s.spaceId);

      const whereClause: any = {
        OR: [
          { userId },
          { assignedToId: userId },
          ...(spaceIds.length > 0 ? [{ spaceId: { in: spaceIds } }] : []),
        ],
      };

      if (status && typeof status === 'string' && status !== 'ALL') {
        whereClause.status = status;
      }

      if (priority && typeof priority === 'string' && priority !== 'ALL') {
        whereClause.priority = priority;
      }

      if (planId && typeof planId === 'string') {
        whereClause.planId = planId;
      }

      if (spaceId && typeof spaceId === 'string') {
        whereClause.spaceId = spaceId;
      }

      if (search && typeof search === 'string') {
        whereClause.AND = [
          {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          },
        ];
      }

      // Quick convenience filter: 'today', 'upcoming', 'overdue'
      if (filter === 'today') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        whereClause.dueDate = { gte: startOfDay, lte: endOfDay };
      } else if (filter === 'overdue') {
        whereClause.dueDate = { lt: new Date() };
        whereClause.status = { not: 'DONE' };
      } else if (filter === 'upcoming') {
        whereClause.dueDate = { gte: new Date() };
      }

      const tasks = await prisma.task.findMany({
        where: whereClause,
        include: {
          subtasks: { orderBy: { order: 'asc' } },
          plan: { select: { id: true, title: true, category: true } },
          space: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, fullName: true, avatarUrl: true } },
        },
        orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
      });

      res.json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { title, description, priority, status, dueDate, reminderDate, planId, spaceId, assignedToId, tags, subtasks } = req.body;

      const task = await prisma.task.create({
        data: {
          userId,
          title,
          description: description || null,
          priority: priority || 'MEDIUM',
          status: status || 'TODO',
          dueDate: dueDate ? new Date(dueDate) : null,
          reminderDate: reminderDate ? new Date(reminderDate) : null,
          planId: planId || null,
          spaceId: spaceId || null,
          assignedToId: assignedToId || null,
          tags: tags || [],
          ...(subtasks && subtasks.length > 0 && {
            subtasks: {
              create: subtasks.map((st: string, idx: number) => ({
                title: st,
                order: idx,
              })),
            },
          }),
        },
        include: {
          subtasks: true,
          plan: { select: { id: true, title: true } },
        },
      });

      res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { title, description, priority, status, dueDate, reminderDate, planId, spaceId, assignedToId, tags } = req.body;

      const existing = await prisma.task.findUnique({ where: { id } });
      if (!existing) throw new AppError('Task not found.', 404, 'NOT_FOUND');

      const updated = await prisma.task.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(priority !== undefined && { priority }),
          ...(status !== undefined && { status }),
          ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
          ...(reminderDate !== undefined && { reminderDate: reminderDate ? new Date(reminderDate) : null }),
          ...(planId !== undefined && { planId }),
          ...(spaceId !== undefined && { spaceId }),
          ...(assignedToId !== undefined && { assignedToId }),
          ...(tags !== undefined && { tags }),
        },
        include: {
          subtasks: { orderBy: { order: 'asc' } },
          plan: { select: { id: true, title: true } },
          assignedTo: { select: { id: true, fullName: true, avatarUrl: true } },
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

  static async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await prisma.task.delete({ where: { id } });
      res.json({
        success: true,
        message: 'Task deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleSubtask(req: Request, res: Response, next: NextFunction) {
    try {
      const { subtaskId } = req.params;
      const subtask = await prisma.subtask.findUnique({ where: { id: subtaskId } });
      if (!subtask) throw new AppError('Subtask not found.', 404);

      const updated = await prisma.subtask.update({
        where: { id: subtaskId },
        data: { isCompleted: !subtask.isCompleted },
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async addSubtask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // taskId
      const { title } = req.body;
      if (!title) throw new AppError('Subtask title is required.', 400);

      const count = await prisma.subtask.count({ where: { taskId: id } });

      const newSubtask = await prisma.subtask.create({
        data: {
          taskId: id,
          title,
          order: count,
        },
      });

      res.status(201).json({
        success: true,
        data: newSubtask,
      });
    } catch (error) {
      next(error);
    }
  }
}
