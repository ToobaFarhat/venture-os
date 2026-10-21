import { FinancialAnalyticsService } from '../../src/analytics/financial.analytics';
import mongoose from 'mongoose';
import { FinancialRecord, Customer } from '../../src/models';
import { config } from '../../src/config';

describe('Financial Analytics Service (Deterministic Calculations)', () => {
  let testWorkspaceId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await mongoose.connect(config.mongoUri);
    testWorkspaceId = new mongoose.Types.ObjectId();

    // Create deterministic test records
    await FinancialRecord.create([
      {
        workspaceId: testWorkspaceId,
        type: 'revenue',
        category: 'Subscription',
        amount: 10000,
        currency: 'USD',
        date: new Date('2026-01-01'),
        recurring: true,
      },
      {
        workspaceId: testWorkspaceId,
        type: 'revenue',
        category: 'Consulting',
        amount: 5000,
        currency: 'USD',
        date: new Date('2026-01-15'),
        recurring: false,
      },
      {
        workspaceId: testWorkspaceId,
        type: 'expense',
        category: 'Payroll',
        amount: 6000,
        currency: 'USD',
        date: new Date('2026-01-10'),
        recurring: true,
      },
      {
        workspaceId: testWorkspaceId,
        type: 'expense',
        category: 'Marketing',
        amount: 3000,
        currency: 'USD',
        date: new Date('2026-01-20'),
        recurring: false,
      },
    ]);

    await Customer.create({
      workspaceId: testWorkspaceId,
      name: 'Test Corp',
      company: 'Test Corp',
      email: 'contact@testcorp.com',
      lifetimeValue: 15000,
      status: 'active',
    });
  });

  afterAll(async () => {
    await FinancialRecord.deleteMany({ workspaceId: testWorkspaceId });
    await Customer.deleteMany({ workspaceId: testWorkspaceId });
    await mongoose.disconnect();
  });

  it('correctly computes total revenue, expenses, and net profit', async () => {
    const metrics = await FinancialAnalyticsService.calculateMetrics(testWorkspaceId.toString());

    expect(metrics.totalRevenue).toBe(15000);
    expect(metrics.totalExpenses).toBe(9000);
    expect(metrics.netProfit).toBe(6000);
    expect(metrics.profitMarginPercent).toBe(40);
  });

  it('correctly calculates recurring MRR and ARR', async () => {
    const metrics = await FinancialAnalyticsService.calculateMetrics(testWorkspaceId.toString());

    expect(metrics.mrr).toBe(10000);
    expect(metrics.arr).toBe(120000);
  });

  it('calculates CAC and LTV deterministically from customer data', async () => {
    const metrics = await FinancialAnalyticsService.calculateMetrics(testWorkspaceId.toString());

    expect(metrics.cac).toBe(3000); // 3000 marketing spend / 1 customer
    expect(metrics.ltv).toBe(15000);
  });
});
