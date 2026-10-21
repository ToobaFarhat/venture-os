import mongoose from 'mongoose';
import { FinancialRecord, Customer } from '../models';

export interface FinancialSummaryMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMarginPercent: number;
  mrr: number;
  arr: number;
  burnRateMonthly: number;
  cashRunwayMonths: number;
  cac: number;
  ltv: number;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  expensesByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export class FinancialAnalyticsService {
  public static async calculateMetrics(workspaceId: string): Promise<FinancialSummaryMetrics> {
    const wsId = new mongoose.Types.ObjectId(workspaceId);

    const records = await FinancialRecord.find({ workspaceId: wsId }).sort({ date: 1 });
    const customers = await Customer.find({ workspaceId: wsId });

    let totalRevenue = 0;
    let totalExpenses = 0;
    let mrr = 0;
    const monthlyMap: Record<string, { revenue: number; expenses: number }> = {};
    const categoryExpenseMap: Record<string, number> = {};

    records.forEach((r) => {
      const d = new Date(r.date);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { revenue: 0, expenses: 0 };
      }

      if (r.type === 'revenue') {
        totalRevenue += r.amount;
        monthlyMap[monthKey].revenue += r.amount;
        if (r.recurring) {
          mrr += r.amount;
        }
      } else {
        totalExpenses += r.amount;
        monthlyMap[monthKey].expenses += r.amount;
        categoryExpenseMap[r.category] = (categoryExpenseMap[r.category] || 0) + r.amount;
      }
    });

    const netProfit = totalRevenue - totalExpenses;
    const profitMarginPercent = totalRevenue > 0 ? Number(((netProfit / totalRevenue) * 100).toFixed(2)) : 0;
    const arr = mrr * 12;

    // Monthly Trends array sorted chronologically
    const monthlyTrends = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.revenue - data.expenses,
      }));

    // Calculate burn rate based on recent 3-month expense average
    const recentMonths = monthlyTrends.slice(-3);
    const recentExpensesSum = recentMonths.reduce((sum, m) => sum + m.expenses, 0);
    const burnRateMonthly = recentMonths.length > 0 ? Number((recentExpensesSum / recentMonths.length).toFixed(2)) : 0;

    // Estimated Cash Runway (Assume current cash reserve is net positive earnings + buffer)
    const currentCashReserve = Math.max(netProfit, 50000);
    const cashRunwayMonths = burnRateMonthly > 0 ? Number((currentCashReserve / burnRateMonthly).toFixed(1)) : 12;

    // CAC & LTV calculations
    const marketingSpend = categoryExpenseMap['Marketing'] || totalExpenses * 0.25;
    const totalCustomers = customers.length;
    const cac = totalCustomers > 0 ? Number((marketingSpend / totalCustomers).toFixed(2)) : 0;

    const totalCustomerLtv = customers.reduce((sum, c) => sum + (c.lifetimeValue || 0), 0);
    const ltv = totalCustomers > 0 ? Number((totalCustomerLtv / totalCustomers).toFixed(2)) : mrr > 0 ? mrr * 14 : 2400;

    // Expenses by Category percentages
    const expensesByCategory = Object.entries(categoryExpenseMap).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? Number(((amount / totalExpenses) * 100).toFixed(1)) : 0,
    }));

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMarginPercent,
      mrr,
      arr,
      burnRateMonthly,
      cashRunwayMonths,
      cac,
      ltv,
      monthlyTrends,
      expensesByCategory,
    };
  }
}
