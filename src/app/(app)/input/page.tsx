'use client';
import { ExpenseForm } from '@/components/input/expense-form';
import { PageTitle } from '@/components/shared/page-title';
import { useRouter } from 'next/navigation';

export default function InputPage() {
  const router = useRouter();

  const handleExpenseAdded = () => {
    // Optional: could navigate or show a success message that stays longer
    // For now, toast in ExpenseForm is primary feedback.
    // Could also trigger a refresh of data on other pages if needed.
    // router.push('/dashboard'); // Example: redirect after adding
  };

  return (
    <div className="space-y-8">
      <PageTitle title="Add New Expense" subtitle="Let the dragon know what you've spent!" />
      <ExpenseForm onExpenseAdded={handleExpenseAdded} />
    </div>
  );
}
