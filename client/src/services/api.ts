import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || '';
// Ensure baseURL ends with /api if not already included
const normalizedBaseURL = rawBaseURL
  ? (rawBaseURL.endsWith('/api') ? rawBaseURL : `${rawBaseURL.replace(/\/+$/, '')}/api`)
  : '/api';

export const api = axios.create({
  baseURL: normalizedBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token and active workspace header to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ventureos_token');
  const activeWorkspaceId = localStorage.getItem('ventureos_workspace_id');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (activeWorkspaceId) {
    config.headers['x-workspace-id'] = activeWorkspaceId;
  }

  return config;
});

// Handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
      localStorage.removeItem('ventureos_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Modular API Services
export const AuthService = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; password: string }) => api.post('/auth/reset-password', data),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
  resendVerification: (email: string) => api.post('/auth/resend-verification', { email }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

export const WorkspaceService = {
  create: (data: any) => api.post('/workspaces', data),
  getDetails: () => api.get('/workspaces/details'),
  updateProfile: (data: any) => api.put('/workspaces/profile', data),
  getMembers: () => api.get('/workspaces/members'),
  inviteMember: (data: any) => api.post('/workspaces/members/invite', data),
  updateMemberRole: (memberId: string, role: string) => api.put(`/workspaces/members/${memberId}/role`, { role }),
};

export const DashboardService = {
  getDashboardData: () => api.get('/dashboard'),
};

export const LeadService = {
  list: (params?: any) => api.get('/leads', { params }),
  create: (data: any) => api.post('/leads', data),
  getById: (id: string) => api.get(`/leads/${id}`),
  update: (id: string, data: any) => api.put(`/leads/${id}`, data),
  score: (id: string) => api.post(`/leads/${id}/score`),
  salesAssistant: (id: string) => api.post(`/leads/${id}/sales-assistant`),
  addInteraction: (id: string, data: any) => api.post(`/leads/${id}/interactions`, data),
  convertToCustomer: (id: string) => api.post(`/leads/${id}/convert-to-customer`),
  delete: (id: string) => api.delete(`/leads/${id}`),
};

export const CustomerService = {
  list: (params?: any) => api.get('/customers', { params }),
  create: (data: any) => api.post('/customers', data),
  getById: (id: string) => api.get(`/customers/${id}`),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data),
  assessHealth: (id: string) => api.post(`/customers/${id}/assess-health`),
};

export const ProjectService = {
  listProjects: () => api.get('/projects'),
  createProject: (data: any) => api.post('/projects', data),
  listTasks: (params?: any) => api.get('/projects/tasks', { params }),
  createTask: (data: any) => api.post('/projects/tasks', data),
  updateTask: (id: string, data: any) => api.put(`/projects/tasks/${id}`, data),
  planWithAI: (data: any) => api.post('/projects/ai-planner', data),
  approvePlan: (data: any) => api.post('/projects/ai-planner/approve', data),
};

export const DocumentService = {
  list: () => api.get('/documents'),
  upload: (formData: FormData) => api.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getById: (id: string) => api.get(`/documents/${id}`),
  reprocess: (id: string) => api.post(`/documents/${id}/reprocess`),
  askRAG: (question: string) => api.post('/documents/rag/ask', { question }),
  delete: (id: string) => api.delete(`/documents/${id}`),
};

export const MeetingService = {
  list: () => api.get('/meetings'),
  analyze: (data: any) => api.post('/meetings/analyze', data),
  approveActionItem: (meetingId: string, actionItemId: string, data: any) =>
    api.post(`/meetings/${meetingId}/action-items/${actionItemId}/approve`, data),
};

export const MarketingService = {
  list: () => api.get('/marketing'),
  create: (data: any) => api.post('/marketing', data),
  generateAIContent: (id: string) => api.post(`/marketing/${id}/ai-content`),
  recordMetrics: (id: string, data: any) => api.post(`/marketing/${id}/metrics`, data),
};

export const CompetitorService = {
  list: () => api.get('/competitors'),
  create: (data: any) => api.post('/competitors', data),
  analyze: (id: string) => api.post(`/competitors/${id}/analyze`),
  generateMarketResearch: () => api.post('/competitors/market-research'),
};

export const FinanceService = {
  list: (params?: any) => api.get('/finance', { params }),
  create: (data: any) => api.post('/finance', data),
  getSummary: () => api.get('/finance/summary'),
  getForecast: () => api.get('/finance/forecast'),
};

export const FeedbackService = {
  list: (params?: any) => api.get('/feedback', { params }),
  create: (data: any) => api.post('/feedback', data),
  importCsv: (formData: FormData) => api.post('/feedback/import-csv', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getTrends: () => api.get('/feedback/trends'),
};

export const CopilotService = {
  chat: (message: string, conversationId?: string) =>
    api.post('/ai/copilot/chat', { message, conversationId }),
  approveAction: (data: any) => api.post('/ai/copilot/approve-action', data),
  getHistory: () => api.get('/ai/copilot/history'),
  getConversation: (id: string) => api.get(`/ai/copilot/conversation/${id}`),
};

export const AdminService = {
  getMetrics: () => api.get('/admin/metrics'),
  getAIUsage: (params?: any) => api.get('/admin/ai-usage', { params }),
  getAuditLogs: (params?: any) => api.get('/admin/audit-logs', { params }),
  listAutomations: () => api.get('/admin/automations'),
  toggleAutomation: (id: string) => api.post(`/admin/automations/${id}/toggle`),
};

export const NotificationService = {
  list: () => api.get('/notifications'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};
