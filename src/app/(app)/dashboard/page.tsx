'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { DaysRemaining } from '@/components/shared/days-remaining';
import { getAllExpenses, getDailyExpenses, getMonthlyExpenses } from '@/lib/localStorageStore';
import type { Expense, SpendingSummary } from '@/lib/types';
import { summarizeSpendingAction } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<SpendingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);

  const fetchSummary = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      const today = new Date();
      const dailyExpenses = getDailyExpenses(user.uid, today);
      const monthlyExpenses = getMonthlyExpenses(user.uid, today.getFullYear(), today.getMonth());
      
      const allExpenses = getAllExpenses(user.uid);
      setRecentExpenses(allExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5));

      const dailyTotal = dailyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const monthlyTotal = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

      const aiResult = await summarizeSpendingAction(dailyTotal, monthlyTotal);
      if ('error' in aiResult) {
        setError(aiResult.error);
        setSummary({ dailyTotal, monthlyTotal, aiSummary: null });
      } else {
        setSummary({ dailyTotal, monthlyTotal, aiSummary: aiResult.summary });
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load spending summary.');
      // Set totals even if AI fails
      const today = new Date();
      const dailyExpenses = getDailyExpenses(user.uid, today);
      const monthlyExpenses = getMonthlyExpenses(user.uid, today.getFullYear(), today.getMonth());
      const dailyTotal = dailyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const monthlyTotal = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      setSummary({ dailyTotal, monthlyTotal, aiSummary: null });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);
  
  // Refresh summary when navigating back to this page (e.g. after adding expense)
  useEffect(() => {
    const handleFocus = () => fetchSummary();
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchSummary]);


  const greeting = user?.displayName ? `Welcome back, ${user.displayName.split(' ')[0]}!` : "Welcome to DragonSpend!";

  return (
    <div className="space-y-8">
      <PageTitle title="Dashboard" subtitle={greeting} />

      {error && (
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Spending</CardTitle>
            <DollarSign className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-3/4" /> : (
              <div className="text-2xl font-bold text-foreground">
                ${summary?.dailyTotal.toFixed(2) || '0.00'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Total for today</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month's Spending</CardTitle>
            <TrendingUp className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-3/4" /> : (
              <div className="text-2xl font-bold text-foreground">
                ${summary?.monthlyTotal.toFixed(2) || '0.00'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Total for current month</p>
          </CardContent>
        </Card>
        
        <DaysRemaining />
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-primary">AI Spending Summary</CardTitle>
          <CardDescription className="text-muted-foreground">A quick overview of your habits.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : summary?.aiSummary ? (
            <p className="text-foreground leading-relaxed">{summary.aiSummary}</p>
          ) : (
            <p className="text-muted-foreground">No summary available. Start tracking to get insights!</p>
          )}
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-primary">Recent Expenses</CardTitle>
          <CardDescription className="text-muted-foreground">Your last few transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : recentExpenses.length > 0 ? (
            <ul className="space-y-3">
              {recentExpenses.map(exp => (
                <li key={exp.id} className="flex justify-between items-center p-3 bg-card rounded-md">
                  <div>
                    <p className="font-medium text-foreground">{exp.description}</p>
                    <p className="text-xs text-muted-foreground">{exp.category} - {new Date(exp.date).toLocaleDateString()}</p>
                  </div>
                  <p className="font-semibold text-primary">${exp.amount.toFixed(2)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No expenses logged yet. Get started!</p>
              <Button asChild variant="secondary">
                <Link href="/input">Add Your First Expense</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
