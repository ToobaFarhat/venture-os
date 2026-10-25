import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app';
import { User, Workspace, WorkspaceMember, Lead, Customer, Feedback } from '../../src/models';
import { config } from '../../src/config';

describe('VentureOS Core End-to-End User Journeys Tests', () => {
  let token: string;
  let workspaceId: string;
  let testUserId: string;

  jest.setTimeout(60000);

  beforeAll(async () => {
    await mongoose.connect(config.mongoUri);

    // Register a test user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Journey Tester',
        email: 'journeytester@example.com',
        password: 'Password123!',
        companyName: 'Journey Test Co',
      });

    token = res.body.data.token;
    workspaceId = res.body.data.activeWorkspace.id;
    testUserId = res.body.data.user.id;
  });

  afterAll(async () => {
    await User.deleteMany({ email: 'journeytester@example.com' });
    await Workspace.deleteMany({ _id: workspaceId });
    await WorkspaceMember.deleteMany({ workspaceId });
    await Lead.deleteMany({ workspaceId });
    await Customer.deleteMany({ workspaceId });
    await Feedback.deleteMany({ workspaceId });
    await mongoose.disconnect();
  });

  it('Journey 2 (Sales Pipeline): Creates Lead -> Runs AI Lead Score -> Converts Won Lead to Customer', async () => {
    // 1. Create Lead
    const createRes = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${token}`)
      .set('x-workspace-id', workspaceId)
      .send({
        name: 'Jonathan Reynolds',
        company: 'Vanguard Aerospace',
        email: 'jonathan@vanguardaero.com',
        dealValue: 55000,
        industry: 'Aerospace',
      });

    expect(createRes.status).toBe(201);
    const leadId = createRes.body.data._id;

    // 2. Score Lead with AI
    const scoreRes = await request(app)
      .post(`/api/leads/${leadId}/score`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-workspace-id', workspaceId);

    expect(scoreRes.status).toBe(200);
    expect(scoreRes.body.data.score).toBeGreaterThan(0);
    expect(scoreRes.body.data.risk).toBeDefined();

    // 2b. AI Sales Assistant (Personalized Pitch, Discovery, Objection Handling)
    const assistantRes = await request(app)
      .post(`/api/leads/${leadId}/sales-assistant`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-workspace-id', workspaceId);

    expect(assistantRes.status).toBe(200);
    expect(assistantRes.body.success).toBe(true);
    expect(assistantRes.body.data.pitch).toBeDefined();
    expect(assistantRes.body.data.pitch.length).toBeGreaterThan(20);
    expect(assistantRes.body.data.discoveryQuestions.length).toBeGreaterThan(0);
    expect(assistantRes.body.data.objectionHandling.length).toBeGreaterThan(0);
    expect(assistantRes.body.data.summary).toBeDefined();

    // 3. Convert to Customer (Status -> Won)
    const convertRes = await request(app)
      .post(`/api/leads/${leadId}/convert-to-customer`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-workspace-id', workspaceId);

    expect(convertRes.status).toBe(201);
    expect(convertRes.body.data.customer).toBeDefined();
    expect(convertRes.body.data.customer.lifetimeValue).toBe(55000);
    expect(convertRes.body.data.lead.status).toBe('Won');
  });

  it('Journey 3 (Customer Retention): Negative Feedback impacts Customer Health and triggers Churn Risk', async () => {
    // 1. Create Customer
    const custRes = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${token}`)
      .set('x-workspace-id', workspaceId)
      .send({
        name: 'Samantha Ray',
        company: 'Acme Retail',
        email: 'samantha@acmeretail.com',
        lifetimeValue: 12000,
      });

    expect(custRes.status).toBe(201);
    const customerId = custRes.body.data._id;
    const initialHealth = custRes.body.data.customerHealthScore; // 85

    // 2. Post Negative Feedback linked to Customer
    const feedbackRes = await request(app)
      .post('/api/feedback')
      .set('Authorization', `Bearer ${token}`)
      .set('x-workspace-id', workspaceId)
      .send({
        customerId,
        customerName: 'Samantha Ray (Acme Retail)',
        content: 'System was extremely slow and the expensive pricing does not justify the slow performance.',
        rating: 1,
      });

    expect(feedbackRes.status).toBe(201);
    expect(feedbackRes.body.data.sentiment).toBe('negative');

    // 3. Verify Customer record was updated downstream
    const updatedCustRes = await request(app)
      .get(`/api/customers/${customerId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-workspace-id', workspaceId);

    expect(updatedCustRes.status).toBe(200);
    expect(updatedCustRes.body.data.customer.customerHealthScore).toBeLessThan(initialHealth);
    expect(updatedCustRes.body.data.customer.status).toBe('churn_risk');
  });

  it('Journey 10 (AI Copilot): Queries sales pipeline tool and prepares controlled action proposal', async () => {
    const copilotRes = await request(app)
      .post('/api/ai/copilot/chat')
      .set('Authorization', `Bearer ${token}`)
      .set('x-workspace-id', workspaceId)
      .send({
        message: 'What is our current sales pipeline status?',
      });

    expect(copilotRes.status).toBe(200);
    expect(copilotRes.body.data.message).toBeDefined();
    expect(copilotRes.body.data.conversationId).toBeDefined();
  });
});
