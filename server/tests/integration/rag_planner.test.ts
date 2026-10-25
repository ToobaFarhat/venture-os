import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app';
import { User, Workspace, WorkspaceMember, Project, Task, DocumentModel, DocumentChunk } from '../../src/models';
import { config } from '../../src/config';
import { TextChunker } from '../../src/rag/chunker';

describe('VentureOS Vector RAG & AI Project Planner Integration Tests', () => {
  let token: string;
  let workspaceId: string;
  let testUserId: string;

  jest.setTimeout(45000);

  beforeAll(async () => {
    await mongoose.connect(config.mongoUri);

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'AI Test Analyst',
        email: 'aianalyst@ragtest.io',
        password: 'Password123!',
        companyName: 'RAG Planner Test Corp',
      });

    token = res.body.data.token;
    workspaceId = res.body.data.activeWorkspace.id;
    testUserId = res.body.data.user.id;
  });

  afterAll(async () => {
    await User.deleteMany({ email: 'aianalyst@ragtest.io' });
    await Workspace.deleteMany({ _id: workspaceId });
    await WorkspaceMember.deleteMany({ workspaceId });
    await Project.deleteMany({ workspaceId });
    await Task.deleteMany({ workspaceId });
    await DocumentModel.deleteMany({ workspaceId });
    await DocumentChunk.deleteMany({ workspaceId });
    await mongoose.disconnect();
  });

  it('1. TextChunker divides text into bounded semantic windows with token metadata', () => {
    const rawText = 'VentureOS architecture isolates client tenants. ' +
      'Every operation checks workspace boundaries. ' +
      'AI algorithms provide bounded decision support. '.repeat(50);

    const chunks = TextChunker.chunkText(rawText, 100, 20);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].tokenCount).toBeGreaterThan(0);
    expect(chunks[0].chunkIndex).toBe(0);
  });

  it('2. Vector Document Storage & Knowledge Base Indexing', async () => {
    // Manually insert an indexed document and chunk into the test workspace
    const doc = await DocumentModel.create({
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
      uploadedBy: new mongoose.Types.ObjectId(testUserId),
      title: 'VentureOS Security Architecture.txt',
      originalName: 'security_spec.txt',
      fileType: 'txt',
      fileSize: 4096,
      storagePath: 'uploads/security_spec.txt',
      status: 'ready',
      extractedText: 'Tenant isolation is strictly enforced via x-workspace-id header and MongoDB filter clauses.',
      summary: 'Architectural overview of tenant security and isolation.',
    });

    expect(doc._id).toBeDefined();

    // Create chunks with deterministic mock embeddings
    const chunk = await DocumentChunk.create({
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
      documentId: doc._id,
      chunkIndex: 0,
      content: 'Tenant isolation is strictly enforced via x-workspace-id header and MongoDB filter clauses.',
      embedding: Array(768).fill(0.1),
      tokenCount: 16,
    });

    expect(chunk._id).toBeDefined();

    // Query Document list API
    const listRes = await request(app)
      .get('/api/documents')
      .set('Authorization', `Bearer ${token}`)
      .set('x-workspace-id', workspaceId);

    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('3. AI Project Planner: Plan Generation -> Human Approval -> Database Record Creation', async () => {
    // 1. Generate Plan Proposal via AI
    const planRes = await request(app)
      .post('/api/projects/ai-planner')
      .set('Authorization', `Bearer ${token}`)
      .set('x-workspace-id', workspaceId)
      .send({
        objective: 'Deploy SOC 2 Type II Compliance Framework',
        scope: 'Audit logging, automated threat detection, and role-based access control policies',
        timelineWeeks: 8,
      });

    expect(planRes.status).toBe(200);
    expect(planRes.body.success).toBe(true);
    expect(planRes.body.data).toBeDefined();
    expect(planRes.body.data.tasks).toBeInstanceOf(Array);
    expect(planRes.body.data.tasks.length).toBeGreaterThan(0);

    const generatedPlan = planRes.body.data;

    // 2. Approve AI Plan (Human-in-the-Loop)
    const approveRes = await request(app)
      .post('/api/projects/ai-planner/approve')
      .set('Authorization', `Bearer ${token}`)
      .set('x-workspace-id', workspaceId)
      .send(generatedPlan);

    expect(approveRes.status).toBe(201);
    expect(approveRes.body.success).toBe(true);
    expect(approveRes.body.data.project).toBeDefined();
    expect(approveRes.body.data.taskCount).toBeGreaterThan(0);

    const projectId = approveRes.body.data.project._id;

    // 3. Verify Project and Tasks exist in real MongoDB collections
    const projectInDb = await Project.findById(projectId);
    expect(projectInDb).toBeDefined();

    const tasksInDb = await Task.find({ projectId });
    expect(tasksInDb.length).toBe(approveRes.body.data.taskCount);
  });
});
