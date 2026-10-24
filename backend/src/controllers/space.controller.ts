import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export class SpaceController {
  static async getSpaces(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const memberships = await prisma.sharedSpaceMember.findMany({
        where: { userId },
        include: {
          space: {
            include: {
              members: {
                include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
              },
              _count: {
                select: { plans: true, tasks: true },
              },
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
      });

      const spaces = memberships.map(m => ({
        id: m.space.id,
        name: m.space.name,
        description: m.space.description,
        createdAt: m.space.createdAt,
        userRole: m.role,
        memberCount: m.space.members.length,
        plansCount: m.space._count.plans,
        tasksCount: m.space._count.tasks,
        members: m.space.members.map(mem => ({
          id: mem.user.id,
          fullName: mem.user.fullName,
          avatarUrl: mem.user.avatarUrl,
          role: mem.role,
        })),
      }));

      res.json({
        success: true,
        data: spaces,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSpaceById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const membership = await prisma.sharedSpaceMember.findUnique({
        where: { spaceId_userId: { spaceId: id, userId } },
      });

      if (!membership) {
        throw new AppError('You are not a member of this space.', 403, 'FORBIDDEN');
      }

      const space = await prisma.sharedSpace.findUnique({
        where: { id },
        include: {
          members: {
            include: { user: { select: { id: true, fullName: true, avatarUrl: true, email: true } } },
          },
          plans: {
            include: { tasks: { select: { id: true, status: true } } },
          },
          tasks: {
            include: {
              assignedTo: { select: { id: true, fullName: true, avatarUrl: true } },
              subtasks: true,
            },
          },
          budget: {
            include: {
              expenses: {
                include: { paidBy: { select: { id: true, fullName: true } } },
                orderBy: { date: 'desc' },
              },
            },
          },
          invitations: {
            where: { expiresAt: { gt: new Date() } },
          },
        },
      });

      if (!space) throw new AppError('Space not found.', 404);

      res.json({
        success: true,
        data: {
          ...space,
          currentUserRole: membership.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async createSpace(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { name, description } = req.body;

      const newSpace = await prisma.$transaction(async tx => {
        const space = await tx.sharedSpace.create({
          data: {
            name,
            description,
            createdById: userId,
          },
        });

        // Add creator as OWNER
        await tx.sharedSpaceMember.create({
          data: {
            spaceId: space.id,
            userId,
            role: 'OWNER',
          },
        });

        // Initialize shared budget
        await tx.budget.create({
          data: {
            spaceId: space.id,
            totalLimit: 0,
            currency: 'USD',
          },
        });

        return space;
      });

      res.status(201).json({
        success: true,
        data: newSpace,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { role, maxUses, expiresDays } = req.body;

      const membership = await prisma.sharedSpaceMember.findUnique({
        where: { spaceId_userId: { spaceId: id, userId } },
      });

      if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
        throw new AppError('Only space owners and admins can invite members.', 403, 'FORBIDDEN');
      }

      const token = crypto.randomBytes(24).toString('hex');
      const expiresAt = new Date(Date.now() + (expiresDays || 7) * 24 * 60 * 60 * 1000);

      const invitation = await prisma.invitation.create({
        data: {
          spaceId: id,
          token,
          role: role || 'MEMBER',
          createdById: userId,
          expiresAt,
          maxUses: maxUses || 10,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          invitation,
          inviteUrl: `/join/${invitation.token}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async joinSpace(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { token } = req.params;

      const invitation = await prisma.invitation.findUnique({
        where: { token },
        include: { space: true },
      });

      if (!invitation) {
        throw new AppError('Invitation link is invalid.', 404, 'INVALID_INVITE');
      }

      if (invitation.expiresAt < new Date()) {
        throw new AppError('This invitation has expired.', 400, 'EXPIRED_INVITE');
      }

      if (invitation.useCount >= invitation.maxUses) {
        throw new AppError('This invitation has reached its maximum uses.', 400, 'INVITE_LIMIT_REACHED');
      }

      // Check if already a member
      const existing = await prisma.sharedSpaceMember.findUnique({
        where: { spaceId_userId: { spaceId: invitation.spaceId, userId } },
      });

      if (existing) {
        return res.json({
          success: true,
          message: 'You are already a member of this space.',
          data: { spaceId: invitation.spaceId },
        });
      }

      await prisma.$transaction([
        prisma.sharedSpaceMember.create({
          data: {
            spaceId: invitation.spaceId,
            userId,
            role: invitation.role,
          },
        }),
        prisma.invitation.update({
          where: { id: invitation.id },
          data: { useCount: { increment: 1 } },
        }),
        prisma.notification.create({
          data: {
            userId: invitation.createdById,
            type: 'INVITATION',
            title: 'New Member Joined!',
            message: `A new member joined "${invitation.space.name}" via your invite link.`,
            link: `/app/spaces/${invitation.spaceId}`,
          },
        }),
      ]);

      res.json({
        success: true,
        message: `Successfully joined ${invitation.space.name}!`,
        data: { spaceId: invitation.spaceId },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMemberRole(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id, memberId } = req.params;
      const { role } = req.body;

      const currentMembership = await prisma.sharedSpaceMember.findUnique({
        where: { spaceId_userId: { spaceId: id, userId } },
      });

      if (!currentMembership || currentMembership.role !== 'OWNER') {
        throw new AppError('Only the space owner can update member roles.', 403, 'FORBIDDEN');
      }

      const updated = await prisma.sharedSpaceMember.update({
        where: { spaceId_userId: { spaceId: id, userId: memberId } },
        data: { role },
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id, memberId } = req.params;

      const currentMembership = await prisma.sharedSpaceMember.findUnique({
        where: { spaceId_userId: { spaceId: id, userId } },
      });

      if (!currentMembership) throw new AppError('Forbidden.', 403);

      // User can leave themselves, or OWNER can remove anyone
      if (userId !== memberId && currentMembership.role !== 'OWNER') {
        throw new AppError('Only the space owner can remove other members.', 403, 'FORBIDDEN');
      }

      await prisma.sharedSpaceMember.delete({
        where: { spaceId_userId: { spaceId: id, userId: memberId } },
      });

      res.json({
        success: true,
        message: 'Member removed successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async addSpaceExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { title, amount, category } = req.body;

      const membership = await prisma.sharedSpaceMember.findUnique({
        where: { spaceId_userId: { spaceId: id, userId } },
      });

      if (!membership || membership.role === 'VIEWER') {
        throw new AppError('You do not have permission to log expenses in this space.', 403, 'FORBIDDEN');
      }

      let budget = await prisma.budget.findUnique({ where: { spaceId: id } });
      if (!budget) {
        budget = await prisma.budget.create({
          data: { spaceId: id, totalLimit: 0, currency: 'USD' },
        });
      }

      const expense = await prisma.expense.create({
        data: {
          budgetId: budget.id,
          paidById: userId,
          title,
          amount,
          category: category || 'Shared',
        },
        include: {
          paidBy: { select: { id: true, fullName: true } },
        },
      });

      res.status(201).json({
        success: true,
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  }
}
