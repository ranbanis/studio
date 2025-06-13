import type { ExpenseCategory } from '@/lib/types';
import { CarFront, UtensilsCrossed, ShoppingCart, Ticket, Zap, Package, HelpCircle } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  category: ExpenseCategory | string; // Allow string for flexibility if new categories emerge
  iconOnly?: boolean;
}

const iconMap: Record<ExpenseCategory, React.ElementType> = {
  'Transport': CarFront,
  'Outside Food': UtensilsCrossed,
  'Groceries': ShoppingCart,
  'Entertainment': Ticket,
  'Utilities': Zap,
  'Miscellaneous': Package,
};

export function CategoryIcon({ category, className, iconOnly = false, ...props }: CategoryIconProps) {
  const IconComponent = iconMap[category as ExpenseCategory] || HelpCircle;
  const defaultClassName = "h-5 w-5 text-accent"; // Gold accent for icons

  return (
    <div className={`flex items-center ${iconOnly ? '' : 'space-x-2'}`}>
      <IconComponent className={cn(defaultClassName, className)} {...props} />
      {!iconOnly && <span className="text-sm capitalize">{category}</span>}
    </div>
  );
}

// Helper function to get a color for a category (for charts etc.)
export const getCategoryColor = (category: ExpenseCategory): string => {
  const colors: Record<ExpenseCategory, string> = {
    'Transport': 'hsl(var(--chart-1))',
    'Outside Food': 'hsl(var(--chart-2))',
    'Groceries': 'hsl(var(--chart-3))',
    'Entertainment': 'hsl(var(--chart-4))',
    'Utilities': 'hsl(var(--chart-5))',
    'Miscellaneous': 'hsl(var(--muted))',
  };
  return colors[category] || 'hsl(var(--muted))';
};
