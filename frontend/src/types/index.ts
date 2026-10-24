export type PlanCategory = 'STUDY' | 'TRAVEL' | 'WORK' | 'PERSONAL' | 'EVENT' | 'FINANCE' | 'HEALTH' | 'OTHER';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type SpaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
export type SavedItemType = 'NOTE' | 'LINK' | 'SCREENSHOT' | 'VOICE' | 'AI_RESULT';
export type NotificationType = 'DEADLINE' | 'INVITATION' | 'ASSIGNMENT' | 'COMMENT' | 'SYSTEM';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  timezone: string;
  bio?: string | null;
  createdAt: string;
}

export interface UserStats {
  plansCount: number;
  tasksCount: number;
  completedTasksCount: number;
  spacesCount: number;
  savedItemsCount: number;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  order: number;
}

export interface Task {
  id: string;
  userId: string;
  planId?: string | null;
  spaceId?: string | null;
  assignedToId?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string | null;
  reminderDate?: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  subtasks?: Subtask[];
  plan?: { id: string; title: string; category?: PlanCategory };
  space?: { id: string; name: string };
  assignedTo?: { id: string; fullName: string; avatarUrl?: string | null };
}

export interface Expense {
  id: string;
  budgetId: string;
  paidById: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  receiptUrl?: string | null;
  paidBy?: { id: string; fullName: string };
}

export interface Budget {
  id: string;
  planId?: string | null;
  spaceId?: string | null;
  totalLimit: number;
  currency: string;
  expenses: Expense[];
}

export interface Plan {
  id: string;
  userId: string;
  spaceId?: string | null;
  title: string;
  description?: string | null;
  category: PlanCategory;
  targetDate?: string | null;
  isCompleted: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; fullName: string; avatarUrl?: string | null };
  tasks?: Task[];
  budget?: Budget | null;
  stats?: {
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
    budgetLimit?: number | null;
    totalExpenses: number;
    currency: string;
  };
}

export interface SharedSpaceMember {
  id: string;
  spaceId: string;
  userId: string;
  role: SpaceRole;
  joinedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string | null;
  };
}

export interface SharedSpace {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  userRole?: SpaceRole;
  currentUserRole?: SpaceRole;
  memberCount?: number;
  plansCount?: number;
  tasksCount?: number;
  members?: SharedSpaceMember[] | any[];
  plans?: Plan[];
  tasks?: Task[];
  budget?: Budget | null;
}

export interface SavedItem {
  id: string;
  userId: string;
  title: string;
  content?: string | null;
  type: SavedItemType;
  sourceUrl?: string | null;
  mediaUrl?: string | null;
  tags: string[];
  aiSummary?: string | null;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface AIMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageUrl?: string;
  structuredData?: any;
  createdAt?: string;
}

export interface AIConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
  lastMessage?: string | null;
  messages?: AIMessage[];
}
