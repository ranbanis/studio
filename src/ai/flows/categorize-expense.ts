// src/ai/flows/categorize-expense.ts
'use server';

/**
 * @fileOverview A flow to categorize expenses from natural language input.
 *
 * - categorizeExpense - A function that categorizes an expense.
 * - CategorizeExpenseInput - The input type for the categorizeExpense function.
 * - CategorizeExpenseOutput - The return type for the categorizeExpense function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeExpenseInputSchema = z.object({
  expenseText: z
    .string()
    .describe('The expense description entered by the user in natural language.'),
});
export type CategorizeExpenseInput = z.infer<typeof CategorizeExpenseInputSchema>;

const CategorizeExpenseOutputSchema = z.object({
  category: z
    .enum([
      'Transport',
      'Outside Food',
      'Groceries',
      'Entertainment',
      'Utilities',
      'Miscellaneous',
    ])
    .describe('The predicted category for the expense.'),
});
export type CategorizeExpenseOutput = z.infer<typeof CategorizeExpenseOutputSchema>;

export async function categorizeExpense(input: CategorizeExpenseInput): Promise<CategorizeExpenseOutput> {
  return categorizeExpenseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeExpensePrompt',
  input: {schema: CategorizeExpenseInputSchema},
  output: {schema: CategorizeExpenseOutputSchema},
  prompt: `Categorize the following expense text into one of these categories: Transport, Outside Food, Groceries, Entertainment, Utilities, Miscellaneous.\n\nExpense Text: {{{expenseText}}}\n\nRespond ONLY with the category name. Do not include any other text.`,
});

const categorizeExpenseFlow = ai.defineFlow(
  {
    name: 'categorizeExpenseFlow',
    inputSchema: CategorizeExpenseInputSchema,
    outputSchema: CategorizeExpenseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
