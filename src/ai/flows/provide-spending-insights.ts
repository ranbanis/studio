// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview Provides insights into monthly spending by category, highlighting top spending categories and offering personalized tips.
 *
 * - provideSpendingInsights - A function that provides insights into monthly spending.
 * - ProvideSpendingInsightsInput - The input type for the provideSpendingInsights function.
 * - ProvideSpendingInsightsOutput - The return type for the provideSpendingInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideSpendingInsightsInputSchema = z.object({
  monthlySpendingData: z
    .string()
    .describe(
      'A string containing the user monthly spending data, structured in a way that is easy to interpret, containing the category and the amount spent in that category.'
    ),
});

export type ProvideSpendingInsightsInput = z.infer<typeof ProvideSpendingInsightsInputSchema>;

const ProvideSpendingInsightsOutputSchema = z.object({
  summary: z.string().describe('A summary of the monthly spending.'),
  topCategories: z.string().describe('The categories with the highest spending.'),
  spendingTips: z.string().describe('Personalized tips for reducing expenses.'),
});

export type ProvideSpendingInsightsOutput = z.infer<typeof ProvideSpendingInsightsOutputSchema>;

export async function provideSpendingInsights(input: ProvideSpendingInsightsInput): Promise<ProvideSpendingInsightsOutput> {
  return provideSpendingInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideSpendingInsightsPrompt',
  input: {schema: ProvideSpendingInsightsInputSchema},
  output: {schema: ProvideSpendingInsightsOutputSchema},
  prompt: `You are a personal finance advisor providing insights into monthly spending.

  Analyze the user's monthly spending data and provide a summary of their spending, highlight the categories with the highest spending, and offer personalized tips for reducing expenses.

  Monthly Spending Data: {{{monthlySpendingData}}}

  Respond in a format that is easy to read and understand.

  The response must contain the summary, topCategories and spendingTips, which are the fields defined in the output schema.`,
});

const provideSpendingInsightsFlow = ai.defineFlow(
  {
    name: 'provideSpendingInsightsFlow',
    inputSchema: ProvideSpendingInsightsInputSchema,
    outputSchema: ProvideSpendingInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
