export type ExpenseCategory =
  | 'Transport'
  | 'Outside Food'
  | 'Groceries'
  | 'Entertainment'
  | 'Utilities'
  | 'Miscellaneous';

export const expenseCategories: ExpenseCategory[] = [
  'Transport',
  'Outside Food',
  'Groceries',
  'Entertainment',
  'Utilities',
  'Miscellaneous',
];

export interface ExpenseInput {
  description: string;
  amount: number;
}

export interface Expense extends ExpenseInput {
  id: string;
  date: string; // ISO string format
  category: ExpenseCategory;
  userId: string;
}

export interface MonthlyBreakdownItem {
  category: ExpenseCategory;
  totalAmount: number;
  percentage: number;
}

export interface SpendingSummary {
  dailyTotal: number;
  monthlyTotal: number;
  aiSummary: string | null;
}

export interface SpendingInsights {
  monthlyCategorizedSpending: MonthlyBreakdownItem[];
  aiInsights: {
    summary: string;
    topCategories: string;
    spendingTips: string;
  } | null;
}
