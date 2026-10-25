import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailDeliveryResult {
  accepted: boolean;
  messageId?: string;
  previewUrl?: string | false;
  error?: string;
}

export class EmailService {
  private static instance: EmailService;
  private transporter: Transporter | null = null;
  private isEthereal = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {
    this.initPromise = this.initTransporter();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private async initTransporter(): Promise<void> {
    try {
      if (config.email.host && config.email.user && config.email.pass) {
        this.transporter = nodemailer.createTransport({
          host: config.email.host,
          port: config.email.port,
          secure: config.email.secure,
          auth: {
            user: config.email.user,
            pass: config.email.pass,
          },
        });
        this.isEthereal = false;
        console.log(`[EmailService] Connected to production SMTP: ${config.email.host}:${config.email.port}`);
      } else {
        // Fallback to ephemeral Ethereal test account for dev/test environments
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        this.isEthereal = true;
        console.log(`[EmailService] Initialized Ethereal test mailbox (${testAccount.user})`);
      }
    } catch (err: any) {
      console.error('[EmailService] Failed to initialize mail transporter:', err.message);
      this.transporter = null;
    }
  }

  public async sendEmail(options: SendEmailOptions): Promise<EmailDeliveryResult> {
    if (this.initPromise) {
      await this.initPromise;
    }

    if (!this.transporter) {
      return {
        accepted: false,
        error: 'Mail transporter is uninitialized or SMTP configuration failed.',
      };
    }

    try {
      const info = await this.transporter.sendMail({
        from: config.email.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]+>/g, ' '),
      });

      const previewUrl = this.isEthereal ? nodemailer.getTestMessageUrl(info) : false;

      return {
        accepted: Boolean(info.accepted && info.accepted.length > 0),
        messageId: info.messageId,
        previewUrl,
      };
    } catch (error: any) {
      console.error('[EmailService] Delivery failed to', options.to, ':', error.message);
      return {
        accepted: false,
        error: error.message || 'Unknown email delivery failure',
      };
    }
  }

  // 1. Email Verification Template
  public async sendVerificationEmail(to: string, name: string, token: string): Promise<EmailDeliveryResult> {
    const verificationUrl = `${config.clientUrl}/login?verify=${token}`;
    const subject = 'Verify your VentureOS Account';
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #020617; color: #f8fafc; margin: 0; padding: 32px 16px; }
    .card { max-width: 560px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 36px; }
    .logo { font-size: 20px; font-weight: 800; color: #3b82f6; letter-spacing: -0.5px; margin-bottom: 24px; }
    h1 { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
    p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; }
    .footer { font-size: 11px; color: #64748b; margin-top: 36px; border-top: 1px solid #1e293b; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">VENTURE<span style="color:#ffffff;">OS</span></div>
    <h1>Welcome, ${name}!</h1>
    <p>Thank you for deploying your intelligent business operations workspace. Please verify your email address to ensure full multi-tenant access.</p>
    <a href="${verificationUrl}" class="btn">Verify Email Address</a>
    <p style="margin-top:24px; font-size:12px;">If the button does not work, copy and paste this verification URL:<br><a href="${verificationUrl}" style="color:#60a5fa;">${verificationUrl}</a></p>
    <div class="footer">
      VentureOS Platform • Automated Verification Engine • TLS 1.3
    </div>
  </div>
</body>
</html>
`;
    return this.sendEmail({ to, subject, html });
  }

  // 2. Password Reset Template
  public async sendPasswordResetEmail(to: string, name: string, token: string): Promise<EmailDeliveryResult> {
    const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;
    const subject = 'Reset your VentureOS Password';
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #020617; color: #f8fafc; margin: 0; padding: 32px 16px; }
    .card { max-width: 560px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 36px; }
    .logo { font-size: 20px; font-weight: 800; color: #3b82f6; letter-spacing: -0.5px; margin-bottom: 24px; }
    h1 { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
    p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; }
    .alert { background: #1e1b4b; border-left: 4px solid #6366f1; padding: 12px; font-size: 12px; color: #c7d2fe; margin-bottom: 24px; }
    .footer { font-size: 11px; color: #64748b; margin-top: 36px; border-top: 1px solid #1e293b; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">VENTURE<span style="color:#ffffff;">OS</span></div>
    <h1>Password Reset Request</h1>
    <p>Hello ${name}, a request was received to reset your VentureOS credentials.</p>
    <div class="alert">
      This link is cryptographically single-use and will expire in <strong>1 hour</strong>.
    </div>
    <a href="${resetUrl}" class="btn">Reset Password</a>
    <p style="margin-top:24px; font-size:12px;">If you did not request this change, please ignore this email or contact your workspace administrator immediately.</p>
    <div class="footer">
      VentureOS Platform • Identity & Security Services
    </div>
  </div>
</body>
</html>
`;
    return this.sendEmail({ to, subject, html });
  }

  // 3. Workspace Invitation Template
  public async sendWorkspaceInvitationEmail(
    to: string,
    inviterName: string,
    workspaceName: string,
    role: string
  ): Promise<EmailDeliveryResult> {
    const inviteUrl = `${config.clientUrl}/login?email=${encodeURIComponent(to)}`;
    const subject = `You've been invited to join ${workspaceName} on VentureOS`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #020617; color: #f8fafc; margin: 0; padding: 32px 16px; }
    .card { max-width: 560px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 36px; }
    .logo { font-size: 20px; font-weight: 800; color: #3b82f6; letter-spacing: -0.5px; margin-bottom: 24px; }
    h1 { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
    p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 20px; }
    .badge { display: inline-block; background: #1e293b; border: 1px solid #334155; padding: 6px 12px; border-radius: 6px; font-size: 13px; color: #60a5fa; font-weight: 600; margin-bottom: 24px; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; }
    .footer { font-size: 11px; color: #64748b; margin-top: 36px; border-top: 1px solid #1e293b; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">VENTURE<span style="color:#ffffff;">OS</span></div>
    <h1>You're invited to collaborate</h1>
    <p><strong>${inviterName}</strong> has invited you to collaborate on the <strong>${workspaceName}</strong> workspace on VentureOS.</p>
    <div class="badge">Assigned Role: ${role}</div>
    <div>
      <a href="${inviteUrl}" class="btn">Accept Invitation & Access Workspace</a>
    </div>
    <div class="footer">
      VentureOS Platform • Multi-Tenant RBAC Authorization
    </div>
  </div>
</body>
</html>
`;
    return this.sendEmail({ to, subject, html });
  }

  // 4. Critical Risk Alert Template
  public async sendRiskAlertEmail(
    to: string,
    name: string,
    riskTitle: string,
    severity: string,
    recommendation: string
  ): Promise<EmailDeliveryResult> {
    const subject = `[CRITICAL RISK ALERT] ${riskTitle}`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #020617; color: #f8fafc; margin: 0; padding: 32px 16px; }
    .card { max-width: 560px; margin: 0 auto; background: #0f172a; border: 1px solid #dc2626; border-radius: 12px; padding: 36px; }
    .logo { font-size: 20px; font-weight: 800; color: #ef4444; letter-spacing: -0.5px; margin-bottom: 24px; }
    h1 { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
    .tag { display: inline-block; background: #450a0a; border: 1px solid #7f1d1d; color: #fca5a5; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; }
    p { font-size: 14px; line-height: 1.6; color: #cbd5e1; margin-bottom: 16px; }
    .box { background: #1e293b; border-left: 4px solid #ef4444; padding: 14px; margin-bottom: 24px; font-size: 13px; color: #e2e8f0; }
    .btn { display: inline-block; background: #dc2626; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; }
    .footer { font-size: 11px; color: #64748b; margin-top: 36px; border-top: 1px solid #1e293b; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">VENTURE<span style="color:#ffffff;">OS</span> RISK DETECTOR</div>
    <div class="tag">Severity: ${severity.toUpperCase()}</div>
    <h1>${riskTitle}</h1>
    <p>Hello ${name}, our cross-module analytics engine has detected an operational anomaly that exceeds authorized tolerance thresholds.</p>
    <div class="box">
      <strong>Recommended Remediation:</strong><br>
      ${recommendation}
    </div>
    <a href="${config.clientUrl}/risk" class="btn">View Risk Matrix</a>
    <div class="footer">
      VentureOS Autonomous Operations Engine • Zero Hallucination Math
    </div>
  </div>
</body>
</html>
`;
    return this.sendEmail({ to, subject, html });
  }
}
