'use server';

import { categorizeExpense as categorizeExpenseFlow } from '@/ai/flows/categorize-expense';
import { summarizeSpending as summarizeSpendingFlow } from '@/ai/flows/summarize-spending';
import { provideSpendingInsights as provideSpendingInsightsFlow } from '@/ai/flows/provide-spending-insights';
import type { Expense, ExpenseCategory, MonthlyBreakdownItem } from './types';

export async function categorizeExpenseAction(expenseText: string): Promise<{ category: ExpenseCategory } | { error: string }> {
  try {
    const result = await categorizeExpenseFlow({ expenseText });
    return { category: result.category as ExpenseCategory };
  } catch (error) {
    console.error('Error categorizing expense:', error);
    return { error: 'Failed to categorize expense. Please try again.' };
  }
}

export async function summarizeSpendingAction(dailySpending: number, monthlySpending: number): Promise<{ summary: string } | { error: string }> {
  try {
    const result = await summarizeSpendingFlow({ dailySpending, monthlySpending });
    return { summary: result.summary };
  } catch (error) {
    console.error('Error summarizing spending:', error);
    return { error: 'Failed to summarize spending.' };
  }
}

export async function provideSpendingInsightsAction(monthlySpendingData: MonthlyBreakdownItem[]): Promise<any | { error: string }> {
  try {
    // Format data for the AI
    const formattedData = monthlySpendingData
      .map(item => `${item.category}: $${item.totalAmount.toFixed(2)}`)
      .join(', ');
    
    if (!formattedData || monthlySpendingData.length === 0) {
      return { summary: "No spending data for this month.", topCategories: "N/A", spendingTips: "Start tracking your expenses to get insights!" };
    }

    const result = await provideSpendingInsightsFlow({ monthlySpendingData: formattedData });
    return result;
  } catch (error)
 {
    console.error('Error providing spending insights:', error);
    return { error: 'Failed to generate insights.' };
  }
}
