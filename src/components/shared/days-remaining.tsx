'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';

export function DaysRemaining() {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const remaining = lastDayOfMonth.getDate() - today.getDate();
    setDaysLeft(remaining);
  }, []);

  if (daysLeft === null) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Days Left This Month</CardTitle>
          <CalendarDays className="h-5 w-5 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Days Left This Month</CardTitle>
        <CalendarDays className="h-5 w-5 text-accent" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{daysLeft}</div>
        <p className="text-xs text-muted-foreground">
          {daysLeft === 1 ? 'day remaining' : 'days remaining'}
        </p>
      </CardContent>
    </Card>
  );
}
