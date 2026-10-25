export type WorkspaceRole = 'Owner' | 'Admin' | 'Manager' | 'Employee' | 'Viewer';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    currency?: string;
  };
  notificationSettings?: {
    emailAlerts: boolean;
    inAppAlerts: boolean;
    riskAlerts: boolean;
  };
}

export interface Workspace {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  industry?: string;
  website?: string;
  description?: string;
  products?: string[];
  services?: string[];
  targetAudience?: string;
  businessGoals?: string[];
  currency?: string;
  role?: WorkspaceRole;
  currentUserRole?: WorkspaceRole;
}

export interface WorkspaceMember {
  _id: string;
  workspaceId: string;
  userId: User;
  role: WorkspaceRole;
  status: 'active' | 'invited';
  invitedEmail?: string;
  joinedAt: string;
}

export interface Lead {
  _id: string;
  workspaceId: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  industry?: string;
  source: string;
  dealValue: number;
  notes?: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
  assignedEmployee?: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  aiScore?: {
    score: number;
    risk: 'low' | 'medium' | 'high';
    reasons: string[];
    recommendedAction: string;
    confidence: number;
    lastAnalyzedAt?: string;
  };
  statusHistory: Array<{
    status: string;
    changedAt: string;
    notes?: string;
  }>;
  tags?: string[];
  convertedCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  _id: string;
  workspaceId: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  industry?: string;
  lifetimeValue: number;
  status: 'active' | 'churn_risk' | 'churned';
  customerHealthScore: number;
  churnRisk?: {
    level: 'low' | 'medium' | 'high';
    reasons: string[];
    recommendedAction: string;
    lastAssessedAt?: string;
  };
  sentimentScore: number;
  sentimentLabel: 'positive' | 'neutral' | 'negative';
  supportTicketsCount: number;
  lastInteractionAt?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Interaction {
  _id: string;
  entityType: 'Lead' | 'Customer';
  entityId: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'proposal' | 'support';
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  conductedBy?: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  date: string;
}

export interface Project {
  _id: string;
  workspaceId: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: string;
  dueDate?: string;
  budget: number;
  aiGenerated?: boolean;
  progressPercentage: number;
  milestones: Array<{
    title: string;
    dueDate?: string;
    completed: boolean;
  }>;
  ownerId?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface Task {
  _id: string;
  workspaceId: string;
  projectId?: {
    _id: string;
    name: string;
  };
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  dueDate?: string;
  subtasks?: Array<{
    title: string;
    completed: boolean;
  }>;
  originType?: 'manual' | 'meeting' | 'crm_followup' | 'risk_recommendation' | 'ai_project_plan' | 'automation';
  createdAt: string;
}

export interface DocumentItem {
  _id: string;
  workspaceId: string;
  title: string;
  originalName: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'csv';
  fileSize: number;
  extractedText?: string;
  summary?: string;
  keyInfo?: string[];
  requirements?: string[];
  risks?: string[];
  deadlines?: Array<{ description: string; date?: string }>;
  chunksCount: number;
  chunks?: any[];
  status: 'uploaded' | 'processing' | 'ready' | 'failed';
  errorMessage?: string;
  uploadedBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface MeetingItem {
  _id: string;
  workspaceId: string;
  title: string;
  date: string;
  transcript: string;
  summary: string;
  keyDecisions: string[];
  requirements: string[];
  actionItems: Array<{
    _id: string;
    title: string;
    suggestedAssignee?: string;
    dueDate?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdTaskId?: string;
  }>;
  risks: string[];
  followUps: string[];
  recordedBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface MarketingCampaignItem {
  _id: string;
  workspaceId: string;
  name: string;
  product: string;
  objective: string;
  audience: string;
  platform: string;
  budget: number;
  startDate?: string;
  endDate?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  aiContent?: {
    strategy?: string;
    personas?: string[];
    contentPillars?: string[];
    ideas?: string[];
    socialPosts?: Array<{ platform: string; postContent: string; hashtags: string[] }>;
    emailSequences?: Array<{ step: number; subject: string; body: string }>;
    adCopy?: Array<{ headline: string; description: string; callToAction: string }>;
    landingPageCopy?: { heroHeadline: string; subhead: string; valueProps: string[]; cta: string };
    ctas?: string[];
  };
  performanceMetrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    revenue: number;
    ctr: number;
    conversionRate: number;
    cac: number;
    roi: number;
  };
  aiRecommendations?: string[];
  createdAt: string;
}

export interface CompetitorItem {
  _id: string;
  workspaceId: string;
  companyName: string;
  website?: string;
  products: string[];
  pricingModel?: string;
  pricingDetails?: string;
  targetAudience?: string;
  features: string[];
  aiAnalysis?: {
    strengths: string[];
    weaknesses: string[];
    pricingComparison: string;
    positioningComparison: string;
    marketGaps: string[];
    opportunities: string[];
    threats: string[];
    lastAnalyzedAt?: string;
  };
}

export interface FinancialRecordItem {
  _id: string;
  type: 'revenue' | 'expense';
  category: string;
  amount: number;
  currency: string;
  date: string;
  description?: string;
  recurring: boolean;
}

export interface FeedbackItem {
  _id: string;
  customerName: string;
  content: string;
  source: string;
  rating?: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  topic: 'delivery' | 'pricing' | 'support' | 'product' | 'other';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  suggestedAction?: string;
  customerId?: {
    _id: string;
    company: string;
    customerHealthScore: number;
  };
  createdAt: string;
}

export interface DetectedRiskItem {
  id: string;
  category: 'Sales' | 'Retention' | 'Finance' | 'Operations';
  severity: 'high' | 'medium' | 'low';
  title: string;
  evidence: string[];
  impact: string;
  recommendation: string;
  proposedAction?: {
    actionType: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    metadata?: any;
  };
}

export interface BusinessHealthReport {
  overallScore: number;
  dimensions: {
    sales: { score: number; status: 'healthy' | 'warning' | 'critical'; metricsSummary: string };
    customerHealth: { score: number; status: 'healthy' | 'warning' | 'critical'; metricsSummary: string };
    marketing: { score: number; status: 'healthy' | 'warning' | 'critical'; metricsSummary: string };
    finance: { score: number; status: 'healthy' | 'warning' | 'critical'; metricsSummary: string };
    operations: { score: number; status: 'healthy' | 'warning' | 'critical'; metricsSummary: string };
  };
  aiExplanation: {
    overview: string;
    strengths: string[];
    weaknesses: string[];
    recommendedActions: string[];
  };
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'lead' | 'task' | 'feedback' | 'risk' | 'automation' | 'system';
  link?: string;
  read: boolean;
  createdAt: string;
}
