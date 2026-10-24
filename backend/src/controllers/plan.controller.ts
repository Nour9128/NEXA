import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export class PlanController {
  static async getPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { category, search, isCompleted, spaceId } = req.query;

      // Find user's spaces to also allow viewing plans in shared spaces
      const userSpaces = await prisma.sharedSpaceMember.findMany({
        where: { userId },
        select: { spaceId: true },
      });
      const spaceIds = userSpaces.map(s => s.spaceId);

      const whereClause: any = {
        OR: [
          { userId },
          ...(spaceIds.length > 0 ? [{ spaceId: { in: spaceIds } }] : []),
        ],
      };

      if (category && typeof category === 'string' && category !== 'ALL') {
        whereClause.category = category;
      }

      if (isCompleted !== undefined) {
        whereClause.isCompleted = isCompleted === 'true';
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

      const plans = await prisma.plan.findMany({
        where: whereClause,
        include: {
          tasks: {
            select: { id: true, status: true, priority: true },
          },
          budget: {
            include: { expenses: { select: { amount: true } } },
          },
          user: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      const formatted = plans.map(p => {
        const totalTasks = p.tasks.length;
        const completedTasks = p.tasks.filter(t => t.status === 'DONE').length;
        const totalExpenses = p.budget?.expenses.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

        return {
          id: p.id,
          userId: p.userId,
          title: p.title,
          description: p.description,
          category: p.category,
          targetDate: p.targetDate,
          isCompleted: p.isCompleted,
          isPublic: p.isPublic,
          spaceId: p.spaceId,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          creator: p.user,
          stats: {
            totalTasks,
            completedTasks,
            progressPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
            budgetLimit: p.budget?.totalLimit ? Number(p.budget.totalLimit) : null,
            totalExpenses,
            currency: p.budget?.currency || 'USD',
          },
        };
      });

      res.json({
        success: true,
        data: formatted,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPlanById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const plan = await prisma.plan.findUnique({
        where: { id },
        include: {
          tasks: {
            include: {
              subtasks: { orderBy: { order: 'asc' } },
              assignedTo: { select: { id: true, fullName: true, avatarUrl: true } },
            },
            orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
          },
          budget: {
            include: {
              expenses: {
                include: { paidBy: { select: { id: true, fullName: true } } },
                orderBy: { date: 'desc' },
              },
            },
          },
          comments: {
            include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
            orderBy: { createdAt: 'desc' },
          },
          user: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
          space: {
            select: { id: true, name: true },
          },
        },
      });

      if (!plan) {
        throw new AppError('Plan not found.', 404, 'NOT_FOUND');
      }

      // Check access permission: creator, or member of space
      if (plan.userId !== userId && !plan.isPublic) {
        if (!plan.spaceId) {
          throw new AppError('You do not have permission to view this plan.', 403, 'FORBIDDEN');
        }
        const member = await prisma.sharedSpaceMember.findUnique({
          where: { spaceId_userId: { spaceId: plan.spaceId, userId } },
        });
        if (!member) {
          throw new AppError('You do not have permission to view this shared plan.', 403, 'FORBIDDEN');
        }
      }

      res.json({
        success: true,
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { title, description, category, targetDate, spaceId, isPublic, tasks, budget } = req.body;

      // If assigning to a space, verify user is a member
      if (spaceId) {
        const member = await prisma.sharedSpaceMember.findUnique({
          where: { spaceId_userId: { spaceId, userId } },
        });
        if (!member) {
          throw new AppError('You are not a member of this shared space.', 403, 'FORBIDDEN');
        }
      }

      // Execute in transaction to ensure consistency
      const newPlan = await prisma.$transaction(async tx => {
        const plan = await tx.plan.create({
          data: {
            userId,
            title,
            description,
            category: category || 'PERSONAL',
            targetDate: targetDate ? new Date(targetDate) : null,
            spaceId: spaceId || null,
            isPublic: isPublic || false,
          },
        });

        // Create tasks if provided
        if (tasks && Array.isArray(tasks) && tasks.length > 0) {
          for (const t of tasks) {
            const task = await tx.task.create({
              data: {
                userId,
                planId: plan.id,
                spaceId: spaceId || null,
                title: t.title,
                description: t.description || null,
                priority: t.priority || 'MEDIUM',
                dueDate: t.dueDate ? new Date(t.dueDate) : null,
                tags: t.tags || [],
              },
            });

            // Create subtasks if provided
            if (t.subtasks && Array.isArray(t.subtasks) && t.subtasks.length > 0) {
              await tx.subtask.createMany({
                data: t.subtasks.map((st: string, idx: number) => ({
                  taskId: task.id,
                  title: st,
                  order: idx,
                })),
              });
            }
          }
        }

        // Create budget if provided
        if (budget && (budget.totalLimit !== undefined || budget.expenses)) {
          const createdBudget = await tx.budget.create({
            data: {
              planId: plan.id,
              totalLimit: budget.totalLimit || 0,
              currency: budget.currency || 'USD',
            },
          });

          if (budget.expenses && Array.isArray(budget.expenses) && budget.expenses.length > 0) {
            await tx.expense.createMany({
              data: budget.expenses.map((exp: any) => ({
                budgetId: createdBudget.id,
                paidById: userId,
                title: exp.title,
                amount: exp.amount,
                category: exp.category || 'General',
              })),
            });
          }
        }

        return plan;
      });

      // Fetch complete created plan
      const fullPlan = await prisma.plan.findUnique({
        where: { id: newPlan.id },
        include: {
          tasks: { include: { subtasks: true } },
          budget: { include: { expenses: true } },
        },
      });

      res.status(201).json({
        success: true,
        data: fullPlan,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updatePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { title, description, category, targetDate, isCompleted, isPublic } = req.body;

      const existing = await prisma.plan.findUnique({ where: { id } });
      if (!existing) throw new AppError('Plan not found.', 404, 'NOT_FOUND');

      // Authorization check
      if (existing.userId !== userId) {
        if (!existing.spaceId) throw new AppError('Unauthorized.', 403, 'FORBIDDEN');
        const member = await prisma.sharedSpaceMember.findUnique({
          where: { spaceId_userId: { spaceId: existing.spaceId, userId } },
        });
        if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
          throw new AppError('You do not have permission to modify this plan.', 403, 'FORBIDDEN');
        }
      }

      const updated = await prisma.plan.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(category !== undefined && { category }),
          ...(targetDate !== undefined && { targetDate: targetDate ? new Date(targetDate) : null }),
          ...(isCompleted !== undefined && { isCompleted }),
          ...(isPublic !== undefined && { isPublic }),
        },
        include: {
          tasks: { include: { subtasks: true } },
          budget: { include: { expenses: true } },
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

  static async deletePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const existing = await prisma.plan.findUnique({ where: { id } });
      if (!existing) throw new AppError('Plan not found.', 404, 'NOT_FOUND');

      if (existing.userId !== userId) {
        if (!existing.spaceId) throw new AppError('Unauthorized.', 403, 'FORBIDDEN');
        const member = await prisma.sharedSpaceMember.findUnique({
          where: { spaceId_userId: { spaceId: existing.spaceId, userId } },
        });
        if (!member || member.role !== 'OWNER') {
          throw new AppError('Only the creator or space owner can delete this plan.', 403, 'FORBIDDEN');
        }
      }

      await prisma.plan.delete({ where: { id } });

      res.json({
        success: true,
        message: 'Plan deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async duplicatePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const source = await prisma.plan.findUnique({
        where: { id },
        include: {
          tasks: { include: { subtasks: true } },
          budget: { include: { expenses: true } },
        },
      });

      if (!source) throw new AppError('Plan not found.', 404, 'NOT_FOUND');

      const duplicated = await prisma.$transaction(async tx => {
        const newPlan = await tx.plan.create({
          data: {
            userId,
            title: `${source.title} (Copy)`,
            description: source.description,
            category: source.category,
            targetDate: source.targetDate,
            isCompleted: false,
            isPublic: false,
          },
        });

        for (const t of source.tasks) {
          const newTask = await tx.task.create({
            data: {
              userId,
              planId: newPlan.id,
              title: t.title,
              description: t.description,
              priority: t.priority,
              status: 'TODO',
              dueDate: t.dueDate,
              tags: t.tags,
            },
          });

          if (t.subtasks.length > 0) {
            await tx.subtask.createMany({
              data: t.subtasks.map(st => ({
                taskId: newTask.id,
                title: st.title,
                isCompleted: false,
                order: st.order,
              })),
            });
          }
        }

        if (source.budget) {
          await tx.budget.create({
            data: {
              planId: newPlan.id,
              totalLimit: source.budget.totalLimit,
              currency: source.budget.currency,
            },
          });
        }

        return newPlan;
      });

      res.status(201).json({
        success: true,
        data: duplicated,
      });
    } catch (error) {
      next(error);
    }
  }
}
