import { config } from 'dotenv';
config();

import '@/ai/flows/categorize-expense.ts';
import '@/ai/flows/provide-spending-insights.ts';
import '@/ai/flows/summarize-spending.ts';