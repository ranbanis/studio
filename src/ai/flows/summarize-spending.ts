// Summarize spending
'use server';

/**
 * @fileOverview Summarizes the user's total daily and monthly spending.
 *
 * - summarizeSpending - A function that handles the summarization of spending.
 * - SummarizeSpendingInput - The input type for the summarizeSpending function.
 * - SummarizeSpendingOutput - The return type for the summarizeSpending function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSpendingInputSchema = z.object({
  dailySpending: z.number().describe('The total spending for the day.'),
  monthlySpending: z.number().describe('The total spending for the month.'),
});
export type SummarizeSpendingInput = z.infer<typeof SummarizeSpendingInputSchema>;

const SummarizeSpendingOutputSchema = z.object({
  summary: z.string().describe('A summary of the daily and monthly spending.'),
});
export type SummarizeSpendingOutput = z.infer<typeof SummarizeSpendingOutputSchema>;

export async function summarizeSpending(input: SummarizeSpendingInput): Promise<SummarizeSpendingOutput> {
  return summarizeSpendingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSpendingPrompt',
  input: {schema: SummarizeSpendingInputSchema},
  output: {schema: SummarizeSpendingOutputSchema},
  prompt: `You are a sophisticated financial advisor for an app named DragonSpend. Your user's name is Ryan.

Analyze the user's spending and provide a short, insightful summary. Your tone should be encouraging and professional, with a subtle, clever nod to the "dragon" and "treasure" theme of the app.

Do not act as a dragon. Instead, use metaphorical language. For example, instead of "your hoard", you might say "your treasure chest" or "your reserves".

Address Ryan directly.

Today's spending: {{{dailySpending}}} Rs.
This month's spending: {{{monthlySpending}}} Rs.`,
});

const summarizeSpendingFlow = ai.defineFlow(
  {
    name: 'summarizeSpendingFlow',
    inputSchema: SummarizeSpendingInputSchema,
    outputSchema: SummarizeSpendingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
