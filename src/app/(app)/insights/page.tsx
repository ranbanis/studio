'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { PageTitle } from '@/components/shared/page-title';
import { CategoryBreakdownChart } from '@/components/insights/category-breakdown-chart';
import { AIPoweredInsights } from '@/components/insights/ai-powered-insights';
import { getMonthlyExpenses } from '@/lib/localStorageStore';
import type { Expense, MonthlyBreakdownItem, ExpenseCategory, SpendingInsights as AISpendingInsightsType } from '@/lib/types';
import { expenseCategories } from '@/lib/types';
import { provideSpendingInsightsAction } from '@/lib/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CategoryIcon } from '@/components/shared/category-icon';
import { Skeleton } from '@/components/ui/skeleton';

export default function InsightsPage() {
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState<MonthlyBreakdownItem[]>([]);
  const [aiInsights, setAiInsights] = useState<AISpendingInsightsType['aiInsights'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const uniqueYears = useMemo(() => {
    // In a real app, derive this from stored expense dates or offer a wider range
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2];
  }, []);

  const months = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: new Date(0, i).toLocaleString('default', { month: 'long' }),
    })), 
  []);

  const fetchInsightsData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      const expensesForMonth = getMonthlyExpenses(user.uid, selectedYear, selectedMonth);
      
      const breakdown: MonthlyBreakdownItem[] = expenseCategories.map(category => ({
        category,
        totalAmount: 0,
        percentage: 0,
      }));

      let totalMonthSpending = 0;
      expensesForMonth.forEach(exp => {
        const categoryItem = breakdown.find(item => item.category === exp.category);
        if (categoryItem) {
          categoryItem.totalAmount += exp.amount;
        }
        totalMonthSpending += exp.amount;
      });

      const finalBreakdown = breakdown
        .map(item => ({
          ...item,
          percentage: totalMonthSpending > 0 ? item.totalAmount / totalMonthSpending : 0,
        }))
        .filter(item => item.totalAmount > 0) // Only show categories with spending
        .sort((a,b) => b.totalAmount - a.totalAmount); // Sort by amount

      setMonthlyData(finalBreakdown);

      if (finalBreakdown.length > 0) {
        const aiResult = await provideSpendingInsightsAction(finalBreakdown);
        if ('error' in aiResult) {
          setError(aiResult.error);
          setAiInsights(null);
        } else {
          setAiInsights(aiResult);
        }
      } else {
        setAiInsights(null); // No data, no AI insights
      }

    } catch (e) {
      console.error(e);
      setError('Failed to load insights data.');
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchInsightsData();
  }, [fetchInsightsData]);

  // Refresh insights when navigating back to this page (e.g. after adding expense)
  useEffect(() => {
    const handleFocus = () => fetchInsightsData();
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchInsightsData]);


  return (
    <div className="space-y-8">
      <PageTitle 
        title="Spending Insights" 
        subtitle="Uncover patterns and get tips from your Dragon Lair." 
        actions={
          <div className="flex gap-4">
            <Select value={String(selectedMonth)} onValueChange={(value) => setSelectedMonth(Number(value))}>
              <SelectTrigger className="w-[180px] bg-input border-border">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month.value} value={String(month.value)}>{month.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
              <SelectTrigger className="w-[120px] bg-input border-border">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {uniqueYears.map(year => (
                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {error && (
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           {isLoading ? <Skeleton className="h-[450px] w-full" /> : <CategoryBreakdownChart data={monthlyData} />}
        </div>
        <AIPoweredInsights insights={aiInsights} isLoading={isLoading} error={error && !aiInsights ? error : null} />
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-primary">Monthly Spending Details</CardTitle>
          <CardDescription className="text-muted-foreground">A tabular view of your spending by category.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : monthlyData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Category</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead className="text-right">Percentage of Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.map((item) => (
                  <TableRow key={item.category}>
                    <TableCell className="font-medium">
                      <CategoryIcon category={item.category} />
                    </TableCell>
                    <TableCell>${item.totalAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{(item.percentage * 100).toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No spending recorded for {months.find(m=>m.value === selectedMonth)?.label} {selectedYear}.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
