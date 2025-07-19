
'use server';

import { categorizeExpense as categorizeExpenseFlow } from '@/ai/flows/categorize-expense';
import { summarizeSpending as summarizeSpendingFlow } from '@/ai/flows/summarize-spending';
import { provideSpendingInsights as provideSpendingInsightsFlow } from '@/ai/flows/provide-spending-insights';
import type { Expense, ExpenseCategory, MonthlyBreakdownItem } from './types';

// Helper to construct the base URL for API calls
const getApiBaseUrl = () => {
  // If NEXT_PUBLIC_APP_URL is set, use it. This is good for explicit configuration.
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  // For Vercel deployments, VERCEL_URL is available and provides the deployment URL.
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Fallback for local development. Assumes Next.js server runs on port 9002.
  // Ensure your 'npm run dev' script uses this port or update here accordingly.
  return `http://localhost:9002`;
};

export async function categorizeExpenseAction(expenseText: string): Promise<{ description: string; amount: number; category: ExpenseCategory } | { error: string }> {
  try {
    const result = await categorizeExpenseFlow({ expenseText });
    return { 
      description: result.description,
      amount: result.amount,
      category: result.category as ExpenseCategory 
    };
  } catch (error) {
    console.error('Error categorizing expense:', error);
    return { error: 'Failed to parse expense from text. Please be more specific about the amount and description.' };
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
      .map(item => `${item.category}: ₹${item.totalAmount.toFixed(2)}`)
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

// Action to add expense by calling our backend API
export async function addExpenseToSheetViaAPI(
  expenseData: Omit<Expense, 'id' | 'date'>
): Promise<{ data?: Expense; success: boolean; message?: string }> {
  const apiUrl = `${getApiBaseUrl()}/api/expenses`;
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expenseData),
    });

    if (!response.ok) {
      const errorResult = await response.json();
      console.error('Failed to add expense via API:', errorResult);
      return { success: false, message: errorResult.error || `Failed to add expense. Server responded with ${response.status}.` };
    }

    const result: Expense = await response.json();
    return { data: result, success: true, message: 'Expense added successfully via API.' };
  } catch (error) {
    console.error('Error calling add expense API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while adding expense.';
    return { success: false, message: `Fetch error: ${errorMessage}. Attempted to reach ${apiUrl}.` };
  }
}

// Action to get all expenses by calling our backend API
export async function getExpensesFromSheetViaAPI(): Promise<{ data?: Expense[]; success: boolean; message?: string }> {
  const apiUrl = `${getApiBaseUrl()}/api/expenses`;
  try {
    // Adding cache: 'no-store' to ensure fresh data is fetched,
    // especially important for dynamic data like expenses.
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorResult = await response.json();
      console.error('Failed to fetch expenses via API:', errorResult);
      return { success: false, message: errorResult.error || `Failed to fetch expenses. Server responded with ${response.status}.` };
    }

    const result: Expense[] = await response.json();
    return { data: result, success: true };
  } catch (error) {
    console.error('Error calling get expenses API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while fetching expenses.';
    return { success: false, message: `Fetch error: ${errorMessage}. Attempted to reach ${apiUrl}.` };
  }
}
