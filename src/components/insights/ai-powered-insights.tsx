'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, AlertTriangle, BarChartBig } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AIPoweredInsightsProps {
  insights: {
    summary: string;
    topCategories: string;
    spendingTips: string;
  } | null;
  isLoading: boolean;
  error?: string | null;
}

export function AIPoweredInsights({ insights, isLoading, error }: AIPoweredInsightsProps) {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-primary flex items-center">
            <Lightbulb className="mr-2 h-6 w-6 text-accent" /> AI Spending Insights
          </CardTitle>
          <CardDescription className="text-muted-foreground">Our dragon is analyzing your scrolls...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Skeleton className="h-4 w-1/3 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div>
            <Skeleton className="h-4 w-1/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-1/3 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" /> Error Generating Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!insights || (!insights.summary && !insights.topCategories && !insights.spendingTips)) {
     return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-primary flex items-center">
            <Lightbulb className="mr-2 h-6 w-6 text-accent" /> AI Spending Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center h-48">
          <BarChartBig className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Not enough data for AI insights yet.</p>
          <p className="text-xs text-muted-foreground">Keep tracking your expenses!</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline text-primary flex items-center">
          <Lightbulb className="mr-2 h-6 w-6 text-accent" /> AI Spending Insights
        </CardTitle>
        <CardDescription className="text-muted-foreground">Personalized advice from the Dragon's hoard of wisdom.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {insights.summary && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Monthly Summary</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{insights.summary}</p>
          </div>
        )}
        {insights.topCategories && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Top Spending Areas</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{insights.topCategories}</p>
          </div>
        )}
        {insights.spendingTips && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Dragon's Savings Tips</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2 leading-relaxed">
              {insights.spendingTips.split('. ').filter(tip => tip.length > 0).map((tip, index) => (
                <li key={index}>{tip.endsWith('.') ? tip : tip + '.'}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
