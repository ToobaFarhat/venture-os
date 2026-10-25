import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app';
import { User, Workspace, WorkspaceMember } from '../../src/models';
import { config } from '../../src/config';
import { EmailService } from '../../src/services/email.service';

describe('VentureOS Email Delivery & Authentication Pipeline Tests', () => {
  jest.setTimeout(30000);

  beforeAll(async () => {
    await mongoose.connect(config.mongoUri);
    await User.deleteMany({ email: /.*@emailtest\.io/ });
  });

  afterAll(async () => {
    await User.deleteMany({ email: /.*@emailtest\.io/ });
    await Workspace.deleteMany({ name: /Email Test Workspace.*/ });
    await mongoose.disconnect();
  });

  it('1. Direct EmailService sends genuine email with transport acceptance', async () => {
    const service = EmailService.getInstance();
    const result = await service.sendEmail({
      to: 'tester@emailtest.io',
      subject: 'Test VentureOS Direct Email',
      html: '<h1>VentureOS Automated Test</h1><p>Genuine transport delivery verification.</p>',
    });

    expect(result.accepted).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  it('2. Registration generates verification token and creates pending user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Email Tester',
        email: 'alice@emailtest.io',
        password: 'Password123!',
        companyName: 'Email Test Workspace One',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const user = await User.findOne({ email: 'alice@emailtest.io' });
    expect(user).toBeDefined();
    expect(user?.isEmailVerified).toBe(false);
    expect(user?.verificationToken).toBeDefined();
  });

  it('3. Email verification endpoint validates token and marks user verified', async () => {
    const user = await User.findOne({ email: 'alice@emailtest.io' });
    expect(user?.verificationToken).toBeDefined();

    const verifyRes = await request(app)
      .get(`/api/auth/verify-email?token=${user!.verificationToken}`);

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);

    const verifiedUser = await User.findOne({ email: 'alice@emailtest.io' });
    expect(verifiedUser?.isEmailVerified).toBe(true);
    expect(verifiedUser?.verificationToken).toBeUndefined();
  });

  it('4. Forgot password endpoint dispatches reset token', async () => {
    const forgotRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'alice@emailtest.io' });

    expect(forgotRes.status).toBe(200);
    expect(forgotRes.body.success).toBe(true);

    const userWithReset = await User.findOne({ email: 'alice@emailtest.io' });
    expect(userWithReset?.resetPasswordToken).toBeDefined();
    expect(userWithReset?.resetPasswordExpires).toBeDefined();
    expect(new Date(userWithReset!.resetPasswordExpires!).getTime()).toBeGreaterThan(Date.now());
  });

  it('5. Reset password endpoint updates password hash and clears reset token', async () => {
    const user = await User.findOne({ email: 'alice@emailtest.io' });
    const resetToken = user!.resetPasswordToken;

    const resetRes = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        password: 'NewStrongPassword456!',
      });

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);

    // Verify user can now log in with the new password
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alice@emailtest.io',
        password: 'NewStrongPassword456!',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.token).toBeDefined();
  });

  it('6. Workspace invitation endpoint creates member and dispatches invitation email', async () => {
    // Log in Alice to get active token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alice@emailtest.io',
        password: 'NewStrongPassword456!',
      });

    const token = loginRes.body.data.token;
    const workspaceId = loginRes.body.data.activeWorkspace.id;

    const inviteRes = await request(app)
      .post('/api/workspaces/members/invite')
      .set('Authorization', `Bearer ${token}`)
      .set('x-workspace-id', workspaceId)
      .send({
        email: 'bob@emailtest.io',
        role: 'Manager',
      });

    expect(inviteRes.status).toBe(201);
    expect(inviteRes.body.success).toBe(true);

    const member = await WorkspaceMember.findOne({
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
      invitedEmail: 'bob@emailtest.io',
    });
    expect(member).toBeDefined();
    expect(member?.role).toBe('Manager');
  });
});
