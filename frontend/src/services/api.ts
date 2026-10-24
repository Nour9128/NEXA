import axios from 'axios';
import { Plan, Task, SharedSpace, SavedItem, Notification, User, UserStats, PlanCategory, AIConversation } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('nexa_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('nexa_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh', { refreshToken });
          const newAccessToken = res.data.data.accessToken;
          localStorage.setItem('nexa_access_token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('nexa_access_token');
          localStorage.removeItem('nexa_refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: any) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (data: any) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  forgotPassword: async (email: string) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },
  resetPassword: async (data: any) => {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  },
  logout: async () => {
    const refreshToken = localStorage.getItem('nexa_refresh_token');
    try {
      await api.post('/auth/logout', { refreshToken });
    } finally {
      localStorage.removeItem('nexa_access_token');
      localStorage.removeItem('nexa_refresh_token');
    }
  },
};

export const userApi = {
  getMe: async (): Promise<{ user: User; stats: UserStats }> => {
    const res = await api.get('/users/me');
    return res.data.data;
  },
  updateMe: async (data: Partial<User>) => {
    const res = await api.patch('/users/me', data);
    return res.data.data.user;
  },
  changePassword: async (data: any) => {
    const res = await api.post('/users/change-password', data);
    return res.data;
  },
  exportData: async () => {
    const res = await api.get('/users/export');
    return res.data;
  },
  deleteMe: async () => {
    const res = await api.delete('/users/me');
    return res.data;
  },
};

export const plansApi = {
  getPlans: async (params?: { category?: string; search?: string; isCompleted?: boolean; spaceId?: string }): Promise<Plan[]> => {
    const res = await api.get('/plans', { params });
    return res.data.data;
  },
  getPlanById: async (id: string): Promise<Plan> => {
    const res = await api.get(`/plans/${id}`);
    return res.data.data;
  },
  createPlan: async (planData: any): Promise<Plan> => {
    const res = await api.post('/plans', planData);
    return res.data.data;
  },
  updatePlan: async (id: string, planData: any): Promise<Plan> => {
    const res = await api.patch(`/plans/${id}`, planData);
    return res.data.data;
  },
  deletePlan: async (id: string) => {
    const res = await api.delete(`/plans/${id}`);
    return res.data;
  },
  duplicatePlan: async (id: string): Promise<Plan> => {
    const res = await api.post(`/plans/${id}/duplicate`);
    return res.data.data;
  },
};

export const tasksApi = {
  getTasks: async (params?: { status?: string; priority?: string; planId?: string; spaceId?: string; search?: string; filter?: string }): Promise<Task[]> => {
    const res = await api.get('/tasks', { params });
    return res.data.data;
  },
  createTask: async (taskData: any): Promise<Task> => {
    const res = await api.post('/tasks', taskData);
    return res.data.data;
  },
  updateTask: async (id: string, taskData: any): Promise<Task> => {
    const res = await api.patch(`/tasks/${id}`, taskData);
    return res.data.data;
  },
  deleteTask: async (id: string) => {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
  },
  addSubtask: async (taskId: string, title: string) => {
    const res = await api.post(`/tasks/${taskId}/subtasks`, { title });
    return res.data.data;
  },
  toggleSubtask: async (subtaskId: string) => {
    const res = await api.patch(`/tasks/subtasks/${subtaskId}/toggle`);
    return res.data.data;
  },
};

export const spacesApi = {
  getSpaces: async (): Promise<SharedSpace[]> => {
    const res = await api.get('/spaces');
    return res.data.data;
  },
  getSpaceById: async (id: string): Promise<SharedSpace> => {
    const res = await api.get(`/spaces/${id}`);
    return res.data.data;
  },
  createSpace: async (data: { name: string; description?: string }): Promise<SharedSpace> => {
    const res = await api.post('/spaces', data);
    return res.data.data;
  },
  createInvitation: async (spaceId: string, data?: any) => {
    const res = await api.post(`/spaces/${spaceId}/invitations`, data || {});
    return res.data.data;
  },
  joinSpace: async (token: string) => {
    const res = await api.post(`/spaces/join/${token}`);
    return res.data;
  },
  updateMemberRole: async (spaceId: string, memberId: string, role: string) => {
    const res = await api.patch(`/spaces/${spaceId}/members/${memberId}`, { role });
    return res.data.data;
  },
  removeMember: async (spaceId: string, memberId: string) => {
    const res = await api.delete(`/spaces/${spaceId}/members/${memberId}`);
    return res.data;
  },
  addSpaceExpense: async (spaceId: string, expenseData: any) => {
    const res = await api.post(`/spaces/${spaceId}/expenses`, expenseData);
    return res.data.data;
  },
};

export const savedItemsApi = {
  getSavedItems: async (params?: { type?: string; isFavorite?: boolean; isArchived?: boolean; search?: string; tag?: string }): Promise<SavedItem[]> => {
    const res = await api.get('/saved-items', { params });
    return res.data.data;
  },
  createSavedItem: async (data: any): Promise<SavedItem> => {
    const res = await api.post('/saved-items', data);
    return res.data.data;
  },
  updateSavedItem: async (id: string, data: any): Promise<SavedItem> => {
    const res = await api.patch(`/saved-items/${id}`, data);
    return res.data.data;
  },
  deleteSavedItem: async (id: string) => {
    const res = await api.delete(`/saved-items/${id}`);
    return res.data;
  },
};

export const notificationsApi = {
  getNotifications: async (): Promise<{ notifications: Notification[]; unreadCount: number }> => {
    const res = await api.get('/notifications');
    return res.data.data;
  },
  markAsRead: async (id: string) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
  deleteNotification: async (id: string) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },
};

export const aiApi = {
  getStatus: async () => {
    const res = await api.get('/ai/status');
    return res.data.data;
  },
  chat: async (messages: Array<{ role: string; content: string; imageUrl?: string }>, conversationId?: string, imageUrl?: string) => {
    const res = await api.post('/ai/chat', { messages, conversationId, imageUrl });
    return res.data.data;
  },
  organize: async (prompt: string, categoryHint?: PlanCategory) => {
    const res = await api.post('/ai/organize', { prompt, categoryHint });
    return res.data.data;
  },
  extract: async (data: { rawContent?: string; type?: string; imageUrl?: string }) => {
    const res = await api.post('/ai/extract', data);
    return res.data.data;
  },
  getConversations: async (): Promise<AIConversation[]> => {
    const res = await api.get('/ai/conversations');
    return res.data.data;
  },
  getConversationById: async (id: string): Promise<AIConversation> => {
    const res = await api.get(`/ai/conversations/${id}`);
    return res.data.data;
  },
};

export const uploadApi = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
};

export default api;
