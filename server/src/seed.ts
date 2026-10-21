import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  User,
  Workspace,
  WorkspaceMember,
  Lead,
  Customer,
  Interaction,
  Project,
  Task,
  DocumentModel,
  DocumentChunk,
  Meeting,
  Competitor,
  MarketingCampaign,
  Feedback,
  FinancialRecord,
  Automation,
  AuditLog,
  AIUsage,
} from './models';
import { config } from './config';
import { AIOrchestrator } from './ai/ai.orchestrator';
import { AuditService } from './services/audit.service';

export const seedDatabase = async () => {
  console.log('[Seed] Starting VentureOS database seeding...');
  await mongoose.connect(config.mongoUri);

  // Clear existing collections for a clean, deterministic state
  await Promise.all([
    User.deleteMany({}),
    Workspace.deleteMany({}),
    WorkspaceMember.deleteMany({}),
    Lead.deleteMany({}),
    Customer.deleteMany({}),
    Interaction.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    DocumentModel.deleteMany({}),
    DocumentChunk.deleteMany({}),
    Meeting.deleteMany({}),
    Competitor.deleteMany({}),
    MarketingCampaign.deleteMany({}),
    Feedback.deleteMany({}),
    FinancialRecord.deleteMany({}),
    Automation.deleteMany({}),
    AuditLog.deleteMany({}),
    AIUsage.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Users
  const userAlex = await User.create({
    name: 'Alex Vance',
    email: 'alex@ventureos.io',
    passwordHash,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    isEmailVerified: true,
    preferences: { theme: 'light', currency: 'USD' },
    notificationSettings: { emailAlerts: true, inAppAlerts: true, riskAlerts: true },
  });

  const userSarah = await User.create({
    name: 'Sarah Chen',
    email: 'sarah@ventureos.io',
    passwordHash,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    isEmailVerified: true,
    preferences: { theme: 'light', currency: 'USD' },
    notificationSettings: { emailAlerts: true, inAppAlerts: true, riskAlerts: true },
  });

  // 2. Primary Flagship Workspace: NovaPulse Analytics
  const workspaceNova = await Workspace.create({
    name: 'NovaPulse Analytics',
    slug: 'novapulse-analytics',
    industry: 'Enterprise B2B Software',
    website: 'https://novapulse.io',
    description: 'Autonomous business intelligence and revenue operations platform for high-growth tech companies.',
    products: ['NovaPulse BI Platform', 'AI Pipeline Engine', 'Automated Churn Predictor'],
    services: ['Strategic Implementation', 'Custom Data Pipeline Engineering'],
    targetAudience: 'Seed to Series B B2B software founders, VP of Sales, and Chief Operating Officers',
    businessGoals: [
      'Scale Monthly Recurring Revenue to $100k within 3 quarters',
      'Maintain gross customer churn rate below 2.5% monthly',
      'Shorten enterprise sales cycle from 45 days to 21 days with AI lead scoring',
    ],
    currency: 'USD',
    ownerId: userAlex._id,
  });

  // 3. Memberships
  await WorkspaceMember.create([
    { workspaceId: workspaceNova._id, userId: userAlex._id, role: 'Owner', status: 'active' },
    { workspaceId: workspaceNova._id, userId: userSarah._id, role: 'Manager', status: 'active' },
  ]);

  // 4. Secondary Workspace (Apex Cloud) for testing workspace isolation!
  const workspaceApex = await Workspace.create({
    name: 'Apex Cloud Systems',
    slug: 'apex-cloud-systems',
    industry: 'Cloud Infrastructure',
    website: 'https://apexcloud.net',
    description: 'DevOps orchestration and serverless cloud monitoring tools.',
    ownerId: userAlex._id,
  });
  await WorkspaceMember.create({ workspaceId: workspaceApex._id, userId: userAlex._id, role: 'Owner', status: 'active' });

  // 5. CRM Leads for NovaPulse
  const lead1 = await Lead.create({
    workspaceId: workspaceNova._id,
    name: 'Marcus Brody',
    company: 'HyperScale Logix',
    email: 'marcus@hyperscalelogix.com',
    phone: '+1 (555) 234-5678',
    industry: 'Logistics & Supply Chain',
    source: 'Website',
    dealValue: 36000,
    notes: 'Prospect is replacing multiple disconnected spreadsheets with an integrated BI platform.',
    status: 'Proposal',
    assignedEmployee: userSarah._id,
    aiScore: {
      score: 88,
      risk: 'low',
      reasons: [
        'Annual revenue exceeds $10M with dedicated RevOps leadership',
        'Strong alignment with NovaPulse supply chain analytics modules',
        'Executive decision timeline scheduled for end of current month',
      ],
      recommendedAction: 'Schedule a tailored ROI presentation with VP of Logistics within 48 hours.',
      confidence: 0.92,
      lastAnalyzedAt: new Date(),
    },
    statusHistory: [
      { status: 'New', changedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
      { status: 'Contacted', changedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
      { status: 'Qualified', changedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
      { status: 'Proposal', changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    ],
    tags: ['Enterprise', 'High Value', 'Tier 1'],
  });

  const lead2 = await Lead.create({
    workspaceId: workspaceNova._id,
    name: 'Elena Rostova',
    company: 'FinVibe Technologies',
    email: 'elena@finvibe.io',
    phone: '+1 (555) 876-5432',
    industry: 'Fintech',
    source: 'LinkedIn',
    dealValue: 24000,
    notes: 'Interested in RAG document intelligence to query compliance contracts.',
    status: 'Qualified',
    assignedEmployee: userSarah._id,
    aiScore: {
      score: 79,
      risk: 'medium',
      reasons: [
        'Fast-growing fintech series A team with immediate budget allocation',
        'Compliance officer requested verification of data residency',
      ],
      recommendedAction: 'Send security & compliance whitepaper and confirm SOC2 certification status.',
      confidence: 0.84,
      lastAnalyzedAt: new Date(),
    },
    statusHistory: [
      { status: 'New', changedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { status: 'Contacted', changedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
      { status: 'Qualified', changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    ],
    tags: ['Fintech', 'Compliance', 'RAG'],
  });

  const leadWon = await Lead.create({
    workspaceId: workspaceNova._id,
    name: 'David Sterling',
    company: 'CloudMatrix Global',
    email: 'david@cloudmatrix.com',
    phone: '+1 (555) 432-1098',
    industry: 'Cloud Infrastructure',
    source: 'Referral',
    dealValue: 48000,
    notes: 'Contract signed for annual enterprise deployment.',
    status: 'Won',
    assignedEmployee: userSarah._id,
    aiScore: {
      score: 95,
      risk: 'low',
      reasons: ['Executive sponsorship', 'Direct board referral', 'Immediate deployment mandate'],
      recommendedAction: 'Initiate VIP onboarding sequence.',
      confidence: 0.98,
      lastAnalyzedAt: new Date(),
    },
    statusHistory: [
      { status: 'New', changedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000) },
      { status: 'Proposal', changedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
      { status: 'Won', changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    ],
    tags: ['Annual Contract', 'VIP'],
  });

  // 6. Customers
  const customer1 = await Customer.create({
    workspaceId: workspaceNova._id,
    name: 'David Sterling',
    company: 'CloudMatrix Global',
    email: 'david@cloudmatrix.com',
    phone: '+1 (555) 432-1098',
    industry: 'Cloud Infrastructure',
    originLeadId: leadWon._id,
    lifetimeValue: 48000,
    status: 'active',
    customerHealthScore: 92,
    churnRisk: {
      level: 'low',
      reasons: ['Consistent active session growth', 'Completed primary workspace onboarding'],
      recommendedAction: 'Invite to customer advisory council.',
      lastAssessedAt: new Date(),
    },
    sentimentLabel: 'positive',
    sentimentScore: 0.85,
    supportTicketsCount: 1,
    tags: ['Enterprise', 'Won Lead'],
  });
  leadWon.convertedCustomerId = customer1._id as any;
  await leadWon.save();

  const customerAtRisk = await Customer.create({
    workspaceId: workspaceNova._id,
    name: 'Rachel Zane',
    company: 'Specter Media Group',
    email: 'rachel@spectermedia.com',
    phone: '+1 (555) 789-0123',
    industry: 'Digital Media',
    lifetimeValue: 18000,
    status: 'churn_risk',
    customerHealthScore: 58,
    churnRisk: {
      level: 'high',
      reasons: [
        'Expressed dissatisfaction with reporting export options',
        'Support ticket SLA missed on last inquiry',
        'Logged pricing pushback during monthly sync',
      ],
      recommendedAction: 'Deploy account recovery manager with custom reporting review.',
      lastAssessedAt: new Date(),
    },
    sentimentLabel: 'negative',
    sentimentScore: -0.65,
    supportTicketsCount: 4,
    tags: ['At Risk', 'Media'],
  });

  // 7. Interactions
  await Interaction.create([
    {
      workspaceId: workspaceNova._id,
      entityType: 'Lead',
      entityId: lead1._id,
      type: 'call',
      summary: 'Discovery call with Marcus Brody. Confirmed 50+ seats requirement and budget sign-off.',
      sentiment: 'positive',
      conductedBy: userSarah._id,
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      workspaceId: workspaceNova._id,
      entityType: 'Customer',
      entityId: customerAtRisk._id,
      type: 'support',
      summary: 'Customer called expressing frustration with export formatting on financial reports.',
      sentiment: 'negative',
      conductedBy: userSarah._id,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ]);

  // 8. Projects and Tasks
  const project1 = await Project.create({
    workspaceId: workspaceNova._id,
    name: 'Enterprise Data Lakehouse Integration',
    description: 'Integrate real-time stream processing and automated risk engine across customer data sources.',
    status: 'in_progress',
    priority: 'high',
    budget: 35000,
    progressPercentage: 65,
    ownerId: userAlex._id,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    milestones: [
      { title: 'Schema Design & Multi-tenant Modeling', completed: true, dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
      { title: 'Vector RAG Search & Chunking Pipeline', completed: true, dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { title: 'Deterministic Financial Analytics Engine', completed: false, dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) },
    ],
  });

  await Task.create([
    {
      workspaceId: workspaceNova._id,
      projectId: project1._id,
      title: 'Verify Compound Indexing on Tenant Collections',
      description: 'Audit MongoDB index definitions for workspaceId isolation performance.',
      status: 'done',
      priority: 'high',
      assigneeId: userAlex._id,
      originType: 'manual',
    },
    {
      workspaceId: workspaceNova._id,
      projectId: project1._id,
      title: 'Address Specter Media Custom Export Blocker',
      description: 'Customer churn prevention: implement CSV and PDF export for customer billing ledger.',
      status: 'in_progress',
      priority: 'urgent',
      assigneeId: userAlex._id,
      originType: 'risk_recommendation',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue to trigger realistic risk engine!
    },
    {
      workspaceId: workspaceNova._id,
      projectId: project1._id,
      title: 'Deploy Automated Churn Recovery Playbook',
      description: 'Automate high-urgency notifications whenever customer feedback sentiment drops below -0.5.',
      status: 'todo',
      priority: 'medium',
      assigneeId: userSarah._id,
      originType: 'automation',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  ]);

  // 9. Customer Feedback
  await Feedback.create([
    {
      workspaceId: workspaceNova._id,
      customerId: customer1._id,
      customerName: 'David Sterling (CloudMatrix)',
      content: 'The AI Copilot has fundamentally changed our Monday executive meetings. Having real data answered in seconds is incredible.',
      rating: 5,
      sentiment: 'positive',
      sentimentScore: 0.95,
      topic: 'product',
      urgency: 'low',
      aiProcessed: true,
      suggestedAction: 'Request a video testimonial for our marketing landing page.',
    },
    {
      workspaceId: workspaceNova._id,
      customerId: customerAtRisk._id,
      customerName: 'Rachel Zane (Specter Media)',
      content: 'We are evaluating alternatives because the subscription pricing feels steep compared to the lack of custom CSV report builders.',
      rating: 2,
      sentiment: 'negative',
      sentimentScore: -0.8,
      topic: 'pricing',
      urgency: 'critical',
      aiProcessed: true,
      suggestedAction: 'Proactively offer enterprise export feature beta access and schedule a success check-in.',
    },
    {
      workspaceId: workspaceNova._id,
      customerName: 'Marcus Miller',
      content: 'Support turnaround was slightly slower during European timezone hours yesterday, though the issue was resolved properly.',
      rating: 3,
      sentiment: 'neutral',
      sentimentScore: -0.15,
      topic: 'support',
      urgency: 'medium',
      aiProcessed: true,
      suggestedAction: 'Adjust support coverage shifts for EU peak hours.',
    },
  ]);

  // 10. Financial Records (Historical monthly revenue and expenses for deterministic aggregations & forecasting)
  const monthsBack = [5, 4, 3, 2, 1, 0];
  const revBase = [28000, 31000, 34500, 38000, 42000, 46500];
  const expBase = [16000, 17500, 18200, 19000, 20500, 21800];

  for (let i = 0; i < monthsBack.length; i++) {
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() - monthsBack[i]);

    // Revenue
    await FinancialRecord.create({
      workspaceId: workspaceNova._id,
      type: 'revenue',
      category: 'Subscription',
      amount: revBase[i],
      currency: 'USD',
      date: monthDate,
      description: `Monthly Enterprise Platform Subscriptions (Period -${monthsBack[i]}M)`,
      recurring: true,
    });

    // Expenses
    await FinancialRecord.create({
      workspaceId: workspaceNova._id,
      type: 'expense',
      category: 'Payroll',
      amount: Math.round(expBase[i] * 0.6),
      currency: 'USD',
      date: monthDate,
      description: 'Engineering & Operations Payroll',
      recurring: true,
    });

    await FinancialRecord.create({
      workspaceId: workspaceNova._id,
      type: 'expense',
      category: 'Infrastructure',
      amount: Math.round(expBase[i] * 0.25),
      currency: 'USD',
      date: monthDate,
      description: 'Cloud Servers & MongoDB Atlas Cluster',
      recurring: true,
    });

    await FinancialRecord.create({
      workspaceId: workspaceNova._id,
      type: 'expense',
      category: 'Marketing',
      amount: Math.round(expBase[i] * 0.15),
      currency: 'USD',
      date: monthDate,
      description: 'LinkedIn B2B Paid Acquisition',
      recurring: false,
    });
  }

  // 11. Marketing Campaigns
  await MarketingCampaign.create({
    workspaceId: workspaceNova._id,
    name: 'Q3 Enterprise Founder Outbound',
    product: 'VentureOS Unified BI',
    objective: 'Drive qualified demo bookings with Series A/B founders',
    audience: 'Founders & Operations Leaders in high-growth technology',
    platform: 'LinkedIn',
    budget: 8500,
    startDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    status: 'active',
    performanceMetrics: {
      impressions: 48500,
      clicks: 1420,
      conversions: 38,
      spend: 6200,
      revenue: 48000,
      ctr: 2.93,
      conversionRate: 2.68,
      cac: 163.16,
      roi: 674.19,
    },
    aiRecommendations: [
      'Scale spend on high-performing copy highlighting unified risk detection',
      'Deploy retargeting ad variant focusing on ROI justification for CFOs',
    ],
  });

  // 12. Competitor Intelligence
  await Competitor.create({
    workspaceId: workspaceNova._id,
    companyName: 'LegacyHub Enterprise',
    website: 'https://legacyhub-example.com',
    products: ['CRM Pro', 'Project Cloud', 'Separate BI Add-on'],
    pricingModel: 'Per Seat / Modular Add-on',
    pricingDetails: '$95/seat/month + $400/month for analytics module',
    targetAudience: 'Traditional enterprise corporations',
    features: ['Contact management', 'Basic Gantt charts', 'Standard reporting'],
    aiAnalysis: {
      strengths: ['Massive brand recognition', 'Global enterprise salesforce'],
      weaknesses: ['Fragmented multi-tool architecture', 'No native cross-module AI risk engine', 'Steep seat-based pricing'],
      pricingComparison: 'LegacyHub charges 3x more due to fragmented add-on licensing fees.',
      positioningComparison: 'Position NovaPulse/VentureOS as the unified, AI-native platform that replaces 4 legacy subscriptions.',
      marketGaps: ['Mid-market founders lack unified risk engines that connect CRM to customer sentiment'],
      opportunities: ['Run targeted switch campaigns offering consolidated transparent pricing'],
      threats: ['Incumbent could acquire a point AI vendor to bundle chat features'],
      lastAnalyzedAt: new Date(),
    },
  });

  // 13. Meeting Intelligence
  await Meeting.create({
    workspaceId: workspaceNova._id,
    title: 'Q3 Product & Operational Strategy Sync',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    transcript: `Alex: Let's review the Q3 strategic deliverables. Sarah, how is the pipeline looking for Marcus Brody at HyperScale?
Sarah: Marcus is in proposal stage for $36k ARR. They love the automated risk engine concept.
Alex: Perfect. However, Rachel at Specter Media flagged negative feedback on reporting exports. We cannot let that turn into churn.
Sarah: Agreed. Let's assign an urgent engineering task to unblock their custom export needs this week.
Alex: Good decision. Also, let's make sure all customer sentiment updates automatically feed into our executive dashboard.`,
    summary: 'Executive sync focused on closing the HyperScale $36k pipeline deal and prioritizing customer retention features for at-risk accounts like Specter Media.',
    keyDecisions: [
      'Deploy immediate custom export capabilities to prevent Specter Media churn',
      'Accelerate proposal negotiations with HyperScale Logix for a $36k ARR contract',
    ],
    requirements: [
      'CRM pipeline must link won deals directly to customer lifetime value',
      'In-app notification system must alert on negative customer sentiment',
    ],
    actionItems: [
      {
        title: 'Unblock custom reporting exports for Specter Media',
        suggestedAssignee: 'Alex Vance',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: 'approved',
      },
      {
        title: 'Send formal contract proposal to Marcus Brody (HyperScale)',
        suggestedAssignee: 'Sarah Chen',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'pending',
      },
    ],
    risks: ['Customer churn if reporting export is delayed past this week'],
    followUps: ['Review retention metrics on Friday'],
    recordedBy: userAlex._id,
  });

  // 14. Document & RAG Vector Chunks
  const orchestrator = AIOrchestrator.getInstance();
  const sampleDocText = `NOVAPULSE OPERATIONS MANUAL & SECURITY SPECIFICATION
Section 1: Multi-Tenant Architecture & Data Isolation
NovaPulse/VentureOS enforces strict multi-workspace tenant isolation. Every data model contains an indexed workspaceId. All vector similarity searches are explicitly scoped by the active workspace identifier to prevent cross-tenant data leakage.

Section 2: SLA & Churn Prevention Policy
Standard customer response time SLA is 4 hours for Tier 1 Enterprise accounts. Whenever customer health drops below 60, an automated recovery task must be created for the designated account owner within 24 hours.

Section 3: Deterministic Financial FP&A Policy
All accounting calculations including MRR, Burn Rate, and Profit Margins are strictly computed deterministically by backend microservices. Generative models must never perform raw arithmetic calculations; rather, the AI layer interprets trends and formulates strategic commentary.`;

  const doc1 = await DocumentModel.create({
    workspaceId: workspaceNova._id,
    title: 'NovaPulse Operations & Security Specification v2.4',
    originalName: 'novapulse_spec_v2.4.txt',
    fileType: 'txt',
    fileSize: sampleDocText.length,
    storagePath: 'uploads/novapulse_spec_v2.4.txt',
    extractedText: sampleDocText,
    summary: 'Core operational manual detailing multi-tenant data isolation, customer SLA recovery policies, and deterministic FP&A arithmetic separation.',
    keyInfo: [
      'Strict multi-tenant workspaceId isolation on all database and vector collections',
      'SLA is 4 hours for Tier 1 Enterprise accounts',
      'Accounting metrics calculated deterministically before AI interpretation',
    ],
    requirements: [
      'Scope all vector similarity queries by workspaceId',
      'Create recovery tasks within 24 hours when customer health < 60',
    ],
    risks: [
      'Cross-tenant data exposure if client-supplied workspace IDs are trusted blindly',
    ],
    deadlines: [
      { description: 'Quarterly Security Audit', date: '2026-10-15' },
    ],
    chunksCount: 3,
    status: 'ready',
    uploadedBy: userAlex._id,
  });

  // Create real embeddings for the document chunks
  const chunks = [
    {
      content: 'NovaPulse Operations Manual Section 1: Multi-Tenant Architecture & Data Isolation. Every data model contains an indexed workspaceId. All vector similarity searches are explicitly scoped by the active workspace identifier to prevent cross-tenant data leakage.',
      section: 'Section 1: Multi-Tenant Architecture',
    },
    {
      content: 'Section 2: SLA & Churn Prevention Policy. Standard customer response time SLA is 4 hours for Tier 1 Enterprise accounts. Whenever customer health drops below 60, an automated recovery task must be created for the designated account owner within 24 hours.',
      section: 'Section 2: SLA & Churn Prevention',
    },
    {
      content: 'Section 3: Deterministic Financial FP&A Policy. All accounting calculations including MRR, Burn Rate, and Profit Margins are strictly computed deterministically by backend microservices. Generative models must never perform raw arithmetic calculations.',
      section: 'Section 3: Financial Analytics Policy',
    },
  ];

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await orchestrator.generateEmbedding(chunks[i].content);
    await DocumentChunk.create({
      workspaceId: workspaceNova._id,
      documentId: doc1._id,
      chunkIndex: i,
      content: chunks[i].content,
      embedding,
      tokenCount: 65,
      metadata: { page: 1, section: chunks[i].section, wordCount: 45 },
    });
  }

  // 15. Automations
  await Automation.create([
    {
      workspaceId: workspaceNova._id,
      name: 'High-Score Lead Fast-Track',
      triggerType: 'lead_score_threshold',
      triggerConfig: { threshold: 80, condition: 'gte' },
      actionType: 'create_task',
      actionConfig: {
        taskTitleTemplate: 'VIP Discovery Call: {{name}}',
        taskPriority: 'urgent',
      },
      isEnabled: true,
      executionCount: 4,
      lastTriggeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      workspaceId: workspaceNova._id,
      name: 'Urgent Negative Feedback Response',
      triggerType: 'negative_feedback',
      triggerConfig: { value: 'negative', condition: 'eq' },
      actionType: 'create_task',
      actionConfig: {
        taskTitleTemplate: 'Customer Churn Remediation: {{name}}',
        taskPriority: 'urgent',
      },
      isEnabled: true,
      executionCount: 2,
      lastTriggeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ]);

  // 16. Audit Log
  await AuditService.record({
    workspaceId: workspaceNova._id,
    userId: userAlex._id,
    action: 'system.initial_seed',
    resource: 'System',
    details: { message: 'Database populated with comprehensive connected operational data' },
  });

  // 17. Initial AI Usage Log
  await AIUsage.create({
    workspaceId: workspaceNova._id,
    userId: userAlex._id,
    module: 'lead_scoring',
    model: 'gemini-1.5-flash',
    promptTokens: 240,
    completionTokens: 85,
    totalTokens: 325,
    estimatedCost: 0.00017,
    latencyMs: 420,
    status: 'success',
  });

  console.log('========================================================');
  console.log('✅ [Seed] VentureOS Database Seed Completed Successfully!');
  console.log('👤 Primary User: alex@ventureos.io (Password: password123)');
  console.log('👤 Sales Lead:   sarah@ventureos.io (Password: password123)');
  console.log('🏢 Primary Workspace: NovaPulse Analytics');
  console.log('🏢 Secondary Isolation Workspace: Apex Cloud Systems');
  console.log('========================================================');

  await mongoose.disconnect();
};

if (require.main === module) {
  seedDatabase().catch((err) => {
    console.error('[Seed] Failure:', err);
    process.exit(1);
  });
}
