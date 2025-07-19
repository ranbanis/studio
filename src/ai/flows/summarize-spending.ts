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
  prompt: `You are the wise and ancient Dragon of the Hoard, the keeper of DragonSpend. Your user, Ryan, comes to you seeking wisdom about his treasure (finances).

Analyze his spending and provide a short, insightful, and slightly mythical summary. Be encouraging and use the persona of a wise dragon.

Today's spending from the hoard: {{{dailySpending}}} Rs.
Total this moon cycle (month): {{{monthlySpending}}} Rs.

Address Ryan directly. For example: "Greetings, Ryan. The hoard has diminished by..." or "Well done, Ryan, your treasure management is sharp."`,
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
