
'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { updateExpenseInSheetViaAPI } from '@/lib/actions';
import type { Expense, ExpenseCategory } from '@/lib/types';
import { expenseCategories } from '@/lib/types';
import { Loader2, AlertTriangle } from 'lucide-react';

const editExpenseFormSchema = z.object({
  description: z.string().min(1, { message: 'Description is required.' }),
  amount: z.coerce.number().min(0.01, { message: 'Amount must be positive.' }),
  category: z.enum(expenseCategories, { required_error: 'Category is required.' }),
});

type EditExpenseFormValues = z.infer<typeof editExpenseFormSchema>;

interface EditExpenseDialogProps {
  expense: Expense | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onExpenseUpdated: (updatedExpense: Expense) => void;
}

export function EditExpenseDialog({ expense, isOpen, onOpenChange, onExpenseUpdated }: EditExpenseDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<EditExpenseFormValues>({
    resolver: zodResolver(editExpenseFormSchema),
  });

  useEffect(() => {
    if (expense) {
      form.reset({
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
      });
      setFormError(null);
    }
  }, [expense, form]);

  const onSubmit: SubmitHandler<EditExpenseFormValues> = async (data) => {
    if (!expense) return;

    setIsSubmitting(true);
    setFormError(null);

    const updatedExpenseData: Expense = {
      ...expense,
      ...data,
    };

    try {
      const result = await updateExpenseInSheetViaAPI(updatedExpenseData);

      if (result.success && result.data) {
        toast({
          title: 'Expense Updated! ✅',
          description: `Changes for "${result.data.description}" have been saved.`,
          variant: 'default',
        });
        onExpenseUpdated(result.data);
        onOpenChange(false);
      } else {
        const errorMessage = result.message || 'Could not save changes to the backend.';
        setFormError(errorMessage);
        toast({
          title: 'Update Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to update expense:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      setFormError(errorMessage);
      toast({
        title: 'Error Updating Expense',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogDescription>
            Make changes to your expense here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...form.register('description')} className="bg-input border-border" />
            {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (Rs.)</Label>
            <Input id="amount" type="number" step="0.01" {...form.register('amount')} className="bg-input border-border" />
            {form.formState.errors.amount && <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={(value) => form.setValue('category', value as ExpenseCategory)} defaultValue={expense?.category}>
              <SelectTrigger id="category" className="w-full bg-input border-border">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.category && <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>}
          </div>
          
          {formError && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive text-sm flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 shrink-0" />
              {formError}
            </div>
          )}
          
          <DialogFooter>
             <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
