'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { MonthlyBreakdownItem } from '@/lib/types';
import { getCategoryColor, CategoryIcon } from '@/components/shared/category-icon';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface CategoryBreakdownChartProps {
  data: MonthlyBreakdownItem[];
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, payload }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't render label for very small slices

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-semibold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 bg-popover border border-border rounded-md shadow-lg text-popover-foreground">
        <div className="flex items-center space-x-2 mb-1">
           <CategoryIcon category={data.category} iconOnly className="h-4 w-4" style={{ color: getCategoryColor(data.category) }} />
           <p className="font-semibold">{data.category}</p>
        </div>
        <p className="text-sm">Amount: ${data.totalAmount.toFixed(2)}</p>
        <p className="text-sm">Percentage: {(data.percentage * 100).toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-primary">Category Breakdown</CardTitle>
          <CardDescription className="text-muted-foreground">Visual representation of your spending.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground">No spending data for this month to display chart.</p>
        </CardContent>
      </Card>
    );
  }
  
  const chartData = data.map(item => ({ ...item, fill: getCategoryColor(item.category) }));

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline text-primary">Category Breakdown</CardTitle>
        <CardDescription className="text-muted-foreground">Visual representation of your spending.</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px] w-full"> {/* Increased height for better legend visibility */}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={120} // Adjusted radius
              innerRadius={60} // Donut chart
              fill="#8884d8"
              dataKey="totalAmount"
              nameKey="category"
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry) => (
                <span style={{ color: entry.color }} className="text-xs">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
