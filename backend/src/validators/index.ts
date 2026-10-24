import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  timezone: z.string().optional().default('UTC'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  timezone: z.string().optional(),
});

export const planCategoryEnum = z.enum([
  'STUDY',
  'TRAVEL',
  'WORK',
  'PERSONAL',
  'EVENT',
  'FINANCE',
  'HEALTH',
  'OTHER',
]);

export const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const taskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']);
export const spaceRoleEnum = z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);
export const savedItemTypeEnum = z.enum(['NOTE', 'LINK', 'SCREENSHOT', 'VOICE', 'AI_RESULT']);

export const createPlanSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  category: planCategoryEnum.default('PERSONAL'),
  targetDate: z.string().datetime().optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()),
  spaceId: z.string().uuid().optional().nullable(),
  isPublic: z.boolean().optional().default(false),
  tasks: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        priority: priorityEnum.default('MEDIUM'),
        dueDate: z.string().optional().nullable(),
        subtasks: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .optional(),
  budget: z
    .object({
      totalLimit: z.number().nonnegative().optional(),
      currency: z.string().default('USD'),
      expenses: z
        .array(
          z.object({
            title: z.string(),
            amount: z.number().positive(),
            category: z.string().default('General'),
          })
        )
        .optional(),
    })
    .optional(),
});

export const updatePlanSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  category: planCategoryEnum.optional(),
  targetDate: z.string().optional().nullable(),
  isCompleted: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  priority: priorityEnum.default('MEDIUM'),
  status: taskStatusEnum.default('TODO'),
  dueDate: z.string().optional().nullable(),
  reminderDate: z.string().optional().nullable(),
  planId: z.string().uuid().optional().nullable(),
  spaceId: z.string().uuid().optional().nullable(),
  assignedToId: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  subtasks: z.array(z.string()).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  priority: priorityEnum.optional(),
  status: taskStatusEnum.optional(),
  dueDate: z.string().optional().nullable(),
  reminderDate: z.string().optional().nullable(),
  planId: z.string().uuid().optional().nullable(),
  spaceId: z.string().uuid().optional().nullable(),
  assignedToId: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export const createSpaceSchema = z.object({
  name: z.string().min(2, 'Space name must be at least 2 characters'),
  description: z.string().max(500).optional(),
});

export const inviteMemberSchema = z.object({
  role: spaceRoleEnum.default('MEMBER'),
  maxUses: z.number().int().positive().default(10),
  expiresDays: z.number().int().positive().default(7),
});

export const updateMemberRoleSchema = z.object({
  role: spaceRoleEnum,
});

export const createSavedItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  type: savedItemTypeEnum.default('NOTE'),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  mediaUrl: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  aiSummary: z.string().optional(),
  isFavorite: z.boolean().optional().default(false),
});

export const updateSavedItemSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export const aiChatSchema = z.object({
  conversationId: z.string().uuid().optional(),
  imageUrl: z.string().optional(),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().max(4000),
      imageUrl: z.string().optional(),
    })
  ).min(1, 'At least one message is required'),
});

export const aiOrganizeSchema = z.object({
  prompt: z.string().min(3, 'Prompt must be at least 3 characters').max(3000),
  categoryHint: planCategoryEnum.optional(),
});

export const aiExtractSchema = z.object({
  rawContent: z.string().optional(),
  type: savedItemTypeEnum.default('NOTE'),
  imageUrl: z.string().optional(),
});
