
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { CategoryBreakdownChart } from '@/components/insights/category-breakdown-chart';
import { AIPoweredInsights } from '@/components/insights/ai-powered-insights';
import { getExpensesFromSheetViaAPI, provideSpendingInsightsAction } from '@/lib/actions';
import type { Expense, MonthlyBreakdownItem, AISpendingInsightsType } from '@/lib/types';
import { expenseCategories } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CategoryIcon } from '@/components/shared/category-icon';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';


export default function InsightsPage() {
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyBreakdownItem[]>([]);
  const [aiInsights, setAiInsights] = useState<AISpendingInsightsType['aiInsights'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const uniqueYears = useMemo(() => {
    // Create a set of years from expenses, plus recent years
    const yearsFromExpenses = Array.from(new Set(allExpenses.map(exp => new Date(exp.date).getFullYear())));
    const currentYear = new Date().getFullYear();
    const defaultYears = [currentYear, currentYear - 1, currentYear - 2];
    const combined = Array.from(new Set([...yearsFromExpenses, ...defaultYears])).sort((a, b) => b - a);
    return combined.slice(0, 5); // Limit to a reasonable number of years
  }, [allExpenses]);

  const months = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: new Date(0, i).toLocaleString('default', { month: 'long' }),
    })), 
  []);

  const processExpensesForSelectedPeriod = useCallback(() => {
    const expensesForMonth = allExpenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getFullYear() === selectedYear && expDate.getMonth() === selectedMonth;
    });
    
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
      .filter(item => item.totalAmount > 0)
      .sort((a,b) => b.totalAmount - a.totalAmount); 

    setMonthlyData(finalBreakdown);
    return finalBreakdown;
  }, [allExpenses, selectedMonth, selectedYear]);


  const fetchInsightsData = useCallback(async (currentMonthlyBreakdown: MonthlyBreakdownItem[]) => {
    // This function now relies on currentMonthlyBreakdown passed after processing allExpenses
    setIsLoading(true); // Keep loading state for AI part
    setError(null); // Reset error for AI part

    try {
      if (currentMonthlyBreakdown.length > 0) {
        const aiResult = await provideSpendingInsightsAction(currentMonthlyBreakdown);
        if ('error' in aiResult) {
          setError(aiResult.error);
          setAiInsights(null);
        } else {
          setAiInsights(aiResult);
        }
      } else {
        setAiInsights(null); // No data for AI insights
      }
    } catch (e) {
      console.error(e);
      const fetchError = e instanceof Error ? e.message : 'Failed to load AI insights.';
      setError(prevError => prevError ? `${prevError} ${fetchError}` : fetchError);
    } finally {
      setIsLoading(false); // Loading complete after AI insights attempt
    }
  }, []); // Removed dependencies as it uses passed data

  // Effect to fetch all expenses once on mount, then process
  useEffect(() => {
    async function loadAllExpenses() {
      setIsLoading(true);
      setError(null);
      const expensesResult = await getExpensesFromSheetViaAPI();
      if (expensesResult.success && expensesResult.data) {
        setAllExpenses(expensesResult.data);
      } else {
        setError(expensesResult.message || 'Failed to load expense data.');
        setAllExpenses([]);
      }
      // setIsLoading(false) will be handled by the subsequent effect that calls fetchInsightsData
    }
    loadAllExpenses();
  }, []);

  // Effect to re-process data and fetch AI insights when allExpenses, month, or year changes
  useEffect(() => {
    if (allExpenses.length > 0 || !isLoading) { // Proceed if expenses loaded or initial load attempt finished
      const currentBreakdown = processExpensesForSelectedPeriod();
      fetchInsightsData(currentBreakdown);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allExpenses, selectedMonth, selectedYear, processExpensesForSelectedPeriod, fetchInsightsData]);


  useEffect(() => {
    const handleFocus = () => {
      // Re-fetch all expenses on focus, then re-process
      async function refreshData() {
        setIsLoading(true);
        const expensesResult = await getExpensesFromSheetViaAPI();
         if (expensesResult.success && expensesResult.data) {
          setAllExpenses(expensesResult.data);
          // Subsequent useEffect will trigger processing and AI insights
        } else {
          setError(expensesResult.message || 'Failed to refresh expense data.');
          setIsLoading(false); // Ensure loading stops if refresh fails
        }
      }
      refreshData();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);


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

      {error && !isLoading && ( // Only show general error if not loading, specific errors handled by components
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" /> Error Loading Insights Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           {isLoading && monthlyData.length === 0 ? <Skeleton className="h-[450px] w-full" /> : <CategoryBreakdownChart data={monthlyData} />}
        </div>
        <AIPoweredInsights insights={aiInsights} isLoading={isLoading && !aiInsights} error={error && !aiInsights ? error : null} />
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-primary">Monthly Spending Details</CardTitle>
          <CardDescription className="text-muted-foreground">A tabular view of your spending by category for {months.find(m=>m.value === selectedMonth)?.label} {selectedYear}.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && monthlyData.length === 0 ? (
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
