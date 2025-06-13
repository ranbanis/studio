'use client';
import type { Expense, ExpenseInput, ExpenseCategory } from './types';

const EXPENSES_STORAGE_KEY_PREFIX = 'dragonspend_expenses_';

function getStorageKey(userId: string): string {
  return `${EXPENSES_STORAGE_KEY_PREFIX}${userId}`;
}

export function getAllExpenses(userId: string): Expense[] {
  if (typeof window === 'undefined') return [];
  const storedExpenses = localStorage.getItem(getStorageKey(userId));
  return storedExpenses ? JSON.parse(storedExpenses) : [];
}

export function addExpenseToStorage(userId: string, description: string, amount: number, category: ExpenseCategory): Expense {
  if (typeof window === 'undefined') throw new Error("localStorage is not available");
  const expenses = getAllExpenses(userId);
  const newExpense: Expense = {
    id: crypto.randomUUID(),
    userId,
    description,
    amount,
    category,
    date: new Date().toISOString(),
  };
  expenses.push(newExpense);
  localStorage.setItem(getStorageKey(userId), JSON.stringify(expenses));
  return newExpense;
}

export function getDailyExpenses(userId: string, date: Date): Expense[] {
  const expenses = getAllExpenses(userId);
  const targetDateString = date.toISOString().split('T')[0];
  return expenses.filter(exp => exp.date.startsWith(targetDateString));
}

export function getMonthlyExpenses(userId: string, year: number, month: number): Expense[] {
  const expenses = getAllExpenses(userId);
  // Month is 0-indexed in JavaScript Date, but typically 1-indexed in user input
  const targetMonthString = `${year}-${String(month + 1).padStart(2, '0')}`;
  return expenses.filter(exp => exp.date.startsWith(targetMonthString));
}
