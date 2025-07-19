
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
    .describe('The expense description entered by the user in natural language, including amount.'),
});
export type CategorizeExpenseInput = z.infer<typeof CategorizeExpenseInputSchema>;

const CategorizeExpenseOutputSchema = z.object({
  description: z.string().describe('The extracted description of the expense.'),
  amount: z.number().describe('The extracted monetary amount of the expense.'),
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
  prompt: `Parse the following expense text. Extract the description, the numerical amount, and categorize it into one of the following: Transport, Outside Food, Groceries, Entertainment, Utilities, Miscellaneous.\n\nThe currency is Rupees (Rs.), even if not explicitly mentioned.\n\nExpense Text: {{{expenseText}}}\n\nReturn a JSON object with the extracted description, amount, and category.`,
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
