
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

// Placeholder action for Google Sheets integration
export async function saveExpenseToGoogleSheet(
  expenseData: Omit<Expense, 'id' | 'date'> // Exclude id, date assuming Sheets might generate its own or date is added serverside
): Promise<{ success: boolean; message?: string }> {
  console.log('Attempting to save expense to Google Sheet (Simulated):', {
    ...expenseData,
    timestamp: new Date().toISOString(), // Add a timestamp for logging
  });
  // In a real implementation, this would involve:
  // 1. Authenticating with Google Sheets API (server-side).
  // 2. Appending a new row with the expenseData to the target Sheet.
  // 3. Handling potential errors from the API.
  
  // Simulate a successful operation for now
  return new Promise(resolve => {
    setTimeout(() => { // Simulate network delay
      // const success = Math.random() > 0.2; // Simulate occasional failure
      const success = true; // For now, always succeed
      if (success) {
        resolve({ success: true, message: 'Expense data logged for Google Sheets.' });
      } else {
        resolve({ success: false, message: 'Simulated failure to save to Google Sheets.' });
      }
    }, 500);
  });
}
