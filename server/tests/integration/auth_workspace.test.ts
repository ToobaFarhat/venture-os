import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app';
import { User, Workspace, WorkspaceMember, Lead } from '../../src/models';
import { config } from '../../src/config';

describe('Authentication & Multi-Tenant Workspace Isolation Integration Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(config.mongoUri);
  });

  afterAll(async () => {
    await User.deleteMany({ email: /test.*@example\.com/ });
    await Workspace.deleteMany({ name: /Test Isolation Workspace.*/ });
    await mongoose.disconnect();
  });

  it('registers a new user and automatically establishes an active workspace', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe Test',
        email: 'testjohn@example.com',
        password: 'Password123!',
        companyName: 'Test Isolation Workspace Alpha',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.activeWorkspace.role).toBe('Owner');
  });

  it('rejects access to protected endpoints without authentication token', async () => {
    const res = await request(app).get('/api/leads');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('strictly prevents cross-workspace tenant data access (Isolation Guarantee)', async () => {
    // 1. Create User Alpha in Workspace Alpha
    const alphaReg = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Alpha',
        email: 'testalpha@example.com',
        password: 'Password123!',
        companyName: 'Test Isolation Workspace Alpha Only',
      });
    const tokenAlpha = alphaReg.body.data.token;
    const wsAlphaId = alphaReg.body.data.activeWorkspace.id;

    // Create a confidential lead in Workspace Alpha
    const leadRes = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${tokenAlpha}`)
      .set('x-workspace-id', wsAlphaId)
      .send({
        name: 'Confidential Lead Alpha',
        company: 'Alpha Secret Corp',
        email: 'secret@alphacorp.com',
        dealValue: 99000,
      });
    expect(leadRes.status).toBe(201);

    // 2. Create User Beta in Workspace Beta
    const betaReg = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Beta',
        email: 'testbeta@example.com',
        password: 'Password123!',
        companyName: 'Test Isolation Workspace Beta Only',
      });
    const tokenBeta = betaReg.body.data.token;

    // 3. User Beta attempts to query Workspace Alpha's leads using Alpha's workspaceId
    const breachAttempt = await request(app)
      .get('/api/leads')
      .set('Authorization', `Bearer ${tokenBeta}`)
      .set('x-workspace-id', wsAlphaId);

    // System MUST reject with 403 Forbidden!
    expect(breachAttempt.status).toBe(403);
    expect(breachAttempt.body.success).toBe(false);
    expect(breachAttempt.body.error).toContain('Access denied');
  });
});
