
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { categorizeExpenseAction, addExpenseToSheetViaAPI } from '@/lib/actions';
import type { ExpenseCategory, Expense } from '@/lib/types';
import { Loader2, AlertTriangle } from 'lucide-react';

const expenseFormSchema = z.object({
  description: z.string().min(1, { message: "Description is required." }).max(100, { message: "Description too long."}),
  amount: z.preprocess(
    (val) => parseFloat(z.string().parse(val)),
    z.number().positive({ message: "Amount must be positive." })
  ),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  onExpenseAdded?: () => void;
}

export function ExpenseForm({ onExpenseAdded }: ExpenseFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: '',
      amount: undefined,
    },
  });

  const onSubmit: SubmitHandler<ExpenseFormValues> = async (data) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      const aiResult = await categorizeExpenseAction(data.description);

      if ('error' in aiResult) {
        setFormError(aiResult.error);
        toast({
          title: 'Categorization Failed',
          description: aiResult.error,
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      const category = aiResult.category as ExpenseCategory;
      
      const expenseDataToSave: Omit<Expense, 'id' | 'date'> = {
        description: data.description,
        amount: data.amount,
        category: category,
      };
      
      const sheetResult = await addExpenseToSheetViaAPI(expenseDataToSave);

      if (sheetResult.success && sheetResult.data) {
        toast({
          title: 'Expense Added! 🔥',
          description: `"${sheetResult.data.description}" for $${sheetResult.data.amount.toFixed(2)} categorized as ${sheetResult.data.category}. Saved to backend.`,
          variant: 'default',
          className: 'bg-secondary text-secondary-foreground border-accent'
        });
      } else {
         toast({
          title: 'Save Failed',
          description: sheetResult.message || 'Could not save data to backend.',
          variant: 'destructive'
        });
        setFormError(sheetResult.message || 'Could not save data to backend.');
      }

      form.reset();
      onExpenseAdded?.();
    } catch (error) {
      console.error('Failed to add expense:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      setFormError(errorMessage);
      toast({
        title: 'Error Adding Expense',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Log New Expense</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your spending details below. Our AI dragon will categorize it!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Expense Description</Label>
            <Textarea
              id="description"
              placeholder="e.g., 'Lunch with team' or 'New dragon miniature'"
              {...form.register('description')}
              className="bg-input border-border focus:ring-accent focus:border-accent"
              rows={3}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-foreground">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="e.g., 42.50"
              {...form.register('amount')}
              className="bg-input border-border focus:ring-accent focus:border-accent"
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
            )}
          </div>
          
          {formError && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive text-destructive text-sm flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 shrink-0" />
              {formError}
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Summoning AI Dragon...' : 'Add Expense & Store'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
