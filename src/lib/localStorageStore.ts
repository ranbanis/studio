
'use client';
import type { Expense, ExpenseCategory } from './types'; // ExpenseInput is not directly used here anymore

// A single global key for all expenses since there's no user context
const GLOBAL_EXPENSES_STORAGE_KEY = 'dragonspend_expenses_global';

function getStorageKey(): string {
  return GLOBAL_EXPENSES_STORAGE_KEY;
}

// userId parameter removed from all functions
export function getAllExpenses(): Expense[] {
  if (typeof window === 'undefined') return [];
  const storedExpenses = localStorage.getItem(getStorageKey());
  return storedExpenses ? JSON.parse(storedExpenses) : [];
}

export function addExpenseToStorage(description: string, amount: number, category: ExpenseCategory): Expense {
  if (typeof window === 'undefined') throw new Error("localStorage is not available");
  const expenses = getAllExpenses();
  const newExpense: Expense = {
    id: crypto.randomUUID(),
    // userId, // Removed
    description,
    amount,
    category,
    date: new Date().toISOString(),
  };
  expenses.push(newExpense);
  localStorage.setItem(getStorageKey(), JSON.stringify(expenses));
  return newExpense;
}

export function getDailyExpenses(date: Date): Expense[] {
  const expenses = getAllExpenses();
  const targetDateString = date.toISOString().split('T')[0];
  return expenses.filter(exp => exp.date.startsWith(targetDateString));
}

export function getMonthlyExpenses(year: number, month: number): Expense[] {
  const expenses = getAllExpenses();
  // Month is 0-indexed in JavaScript Date
  const targetMonthString = `${year}-${String(month + 1).padStart(2, '0')}`;
  return expenses.filter(exp => exp.date.startsWith(targetMonthString));
}
