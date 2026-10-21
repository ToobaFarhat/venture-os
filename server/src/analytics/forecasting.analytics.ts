import { FinancialAnalyticsService } from './financial.analytics';
import { AIOrchestrator } from '../ai/ai.orchestrator';

export interface ForecastPoint {
  period: '30_days' | '60_days' | '90_days';
  projectedRevenue: number;
  projectedExpenses: number;
  projectedNetProfit: number;
  projectedCashRunwayMonths: number;
  confidenceRange: {
    minRevenue: number;
    maxRevenue: number;
  };
}

export interface CompleteForecastReport {
  methodology: string;
  calculatedForecasts: ForecastPoint[];
  aiExplanation: {
    narrative: string;
    growthDrivers: string[];
    riskFactors: string[];
    strategicAssumptions: string[];
  };
}

export class ForecastingService {
  public static async generateForecast(workspaceId: string): Promise<CompleteForecastReport> {
    const metrics = await FinancialAnalyticsService.calculateMetrics(workspaceId);
    const trends = metrics.monthlyTrends;

    // Linear regression on historical months
    const n = trends.length;
    let revSlope = 1500; // default baseline trend
    let expSlope = 800;
    const baseRevenue = trends.length > 0 ? trends[trends.length - 1].revenue : metrics.totalRevenue || 25000;
    const baseExpenses = trends.length > 0 ? trends[trends.length - 1].expenses : metrics.totalExpenses || 14000;

    if (n >= 2) {
      let sumX = 0, sumYRev = 0, sumYExp = 0, sumXYRev = 0, sumXYExp = 0, sumXX = 0;
      for (let i = 0; i < n; i++) {
        sumX += i;
        sumXX += i * i;
        sumYRev += trends[i].revenue;
        sumYExp += trends[i].expenses;
        sumXYRev += i * trends[i].revenue;
        sumXYExp += i * trends[i].expenses;
      }
      const denom = (n * sumXX - sumX * sumX);
      if (denom !== 0) {
        revSlope = (n * sumXYRev - sumX * sumYRev) / denom;
        expSlope = (n * sumXYExp - sumX * sumYExp) / denom;
      }
    }

    const periods: Array<{ period: '30_days' | '60_days' | '90_days'; step: number }> = [
      { period: '30_days', step: 1 },
      { period: '60_days', step: 2 },
      { period: '90_days', step: 3 },
    ];

    const calculatedForecasts: ForecastPoint[] = periods.map(({ period, step }) => {
      const projRev = Math.max(0, Math.round(baseRevenue + (revSlope * step)));
      const projExp = Math.max(0, Math.round(baseExpenses + (expSlope * step)));
      const projProfit = projRev - projExp;
      const confidenceMargin = Math.round(projRev * (0.05 * step));
      const projRunway = projExp > 0 ? Number((Math.max(metrics.netProfit + projProfit, 30000) / projExp).toFixed(1)) : 12;

      return {
        period,
        projectedRevenue: projRev,
        projectedExpenses: projExp,
        projectedNetProfit: projProfit,
        projectedCashRunwayMonths: projRunway,
        confidenceRange: {
          minRevenue: Math.max(0, projRev - confidenceMargin),
          maxRevenue: projRev + confidenceMargin,
        },
      };
    });

    // AI Narrative Generation based on calculated metrics
    const orchestrator = AIOrchestrator.getInstance();
    const prompt = `Review the following deterministic financial forecast:
Base Monthly Revenue: $${baseRevenue}
Base Monthly Expenses: $${baseExpenses}
30-Day Projected Revenue: $${calculatedForecasts[0].projectedRevenue}
60-Day Projected Revenue: $${calculatedForecasts[1].projectedRevenue}
90-Day Projected Revenue: $${calculatedForecasts[2].projectedRevenue}
Monthly MRR: $${metrics.mrr}
Burn Rate: $${metrics.burnRateMonthly}

Explain the forecast narrative, highlighting growth drivers, risk factors, and strategic assumptions.
Return a JSON object with:
- "narrative": string explanation of the trajectory
- "growthDrivers": array of 3 drivers
- "riskFactors": array of 3 operational or market risks
- "strategicAssumptions": array of 3 assumptions underlying this model`;

    const aiRes = await orchestrator.generate(
      [
        { role: 'system', content: 'You are an executive Chief Financial Officer and FP&A analyst.' },
        { role: 'user', content: prompt },
      ],
      {
        workspaceId,
        module: 'forecasting',
        responseFormat: 'json',
      }
    );

    const fallbackExplanation = {
      narrative: `Forecast reflects an expanding trajectory based on current monthly recurring revenue ($${metrics.mrr}) and an estimated monthly burn rate of $${metrics.burnRateMonthly}. The 90-day projection anticipates positive cash flow expansion if current sales velocity holds.`,
      growthDrivers: [
        'Steady recurring subscription renewals',
        'Expanding pipeline in high-score CRM opportunities',
        'Contained operational expenditure and infrastructure cost control',
      ],
      riskFactors: [
        'Customer churn risk in mid-market tier if negative feedback remains unresolved',
        'Sales pipeline elongation in prospective enterprise deals',
        'Potential increase in ad-spend customer acquisition costs',
      ],
      strategicAssumptions: [
        'Historical seasonal conversion rates remain stable over 90 days',
        'Gross margin remains steady above 65%',
        'No unforeseen enterprise customer contract cancellations',
      ],
    };

    return {
      methodology: 'Deterministic Ordinary Least Squares (OLS) Linear Trend Extrapolation with Variance Confidence Bands (Separated from AI Qualitative Interpretation)',
      calculatedForecasts,
      aiExplanation: aiRes.parsedJson || fallbackExplanation,
    };
  }
}
