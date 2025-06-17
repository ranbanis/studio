
// src/app/api/expenses/route.ts
import { google } from 'googleapis';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { Expense, ExpenseCategory } from '@/lib/types';

// Ensure environment variables are loaded
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_RAW = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;

// --- Helper function to initialize Google Sheets API client ---
async function getSheetsClient() {
  if (!GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_RAW) {
    console.error('CRITICAL: GOOGLE_SERVICE_ACCOUNT_CREDENTIALS environment variable is not set. Value: ', GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_RAW);
    throw new Error('CRITICAL: The GOOGLE_SERVICE_ACCOUNT_CREDENTIALS environment variable is not set in your .env or .env.local file, or server environment. This is required for Google Sheets authentication. Please set it (as a single-line JSON string) and restart your server.');
  }
  if (!GOOGLE_SHEET_ID) {
    console.error('CRITICAL: GOOGLE_SHEET_ID environment variable is not set. Value: ', GOOGLE_SHEET_ID);
    throw new Error('CRITICAL: The GOOGLE_SHEET_ID environment variable is not set in your .env or .env.local file, or server environment. This is required to identify your Google Sheet. Please set it and restart your server.');
  }

  let credentials;
  try {
    credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_RAW);
  } catch (error) {
    console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_CREDENTIALS. Ensure it is a valid JSON string (ideally single-line) in your .env or .env.local file. Raw value was:', `"${GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_RAW}"`, 'Error:', error);
    throw new Error('GOOGLE_SERVICE_ACCOUNT_CREDENTIALS is not valid JSON. Please check its format in your .env or .env.local file and restart your server.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient as any }); // Cast to any to satisfy type
  return sheets;
}

// --- POST Handler to add an expense ---
export async function POST(request: NextRequest) {
  const sheetNameAndRange = 'DragonSpend!A:E'; // Corrected to match user's sheet name
  try {
    const sheets = await getSheetsClient();
    const expenseData = (await request.json()) as Omit<Expense, 'id' | 'date'>; 

    if (!expenseData.description || typeof expenseData.amount !== 'number' || !expenseData.category) {
      return NextResponse.json({ error: 'Missing required expense fields.' }, { status: 400 });
    }
    
    const newId = crypto.randomUUID();
    const date = new Date().toISOString();

    const newExpenseRow = [
      newId,
      date,
      expenseData.description,
      expenseData.amount,
      expenseData.category,
    ];

    // Ensure your sheet has columns in the order: ID, Date, Description, Amount, Category
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID!, 
      range: sheetNameAndRange, 
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [newExpenseRow],
      },
    });
    
    const savedExpense: Expense = { ...expenseData, id: newId, date };
    return NextResponse.json(savedExpense, { status: 201 });

  } catch (error) {
    console.error(`Google Sheets API Error (POST) for Sheet ID: [${GOOGLE_SHEET_ID}], Range: [${sheetNameAndRange}]:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to add expense to sheet.';
    return NextResponse.json({ error: `Server error: ${errorMessage}` }, { status: 500 });
  }
}

// --- GET Handler to fetch all expenses ---
export async function GET() {
  const sheetNameAndRange = 'DragonSpend!A:E'; // Corrected to match user's sheet name
  try {
    const sheets = await getSheetsClient();

    // Assumes columns: ID, Date, Description, Amount, Category
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID!, 
      range: sheetNameAndRange, 
    });
    
    const rows = response.data.values;
    if (rows && rows.length > 1) { // Assuming first row is header
      const expenses: Expense[] = rows.slice(1).map((row: any[]) => {
        if (row.length < 5) {
          console.warn('Skipping malformed row:', row);
          return null; 
        }
        const amount = parseFloat(row[3]);
        if (isNaN(amount)) {
          console.warn('Skipping row with invalid amount:', row);
          return null;
        }
        return {
          id: row[0] || crypto.randomUUID(), 
          date: row[1] || new Date().toISOString(), 
          description: row[2] || 'N/A',
          amount: amount,
          category: row[4] as ExpenseCategory || 'Miscellaneous', 
        };
      }).filter(exp => exp !== null) as Expense[]; 
      return NextResponse.json(expenses);
    } else if (rows && rows.length <= 1) { // Handles empty sheet or sheet with only header
      return NextResponse.json([]); // Return empty array if no data rows
    } else { // Handles case where rows is undefined or null
      return NextResponse.json([]); 
    }

  } catch (error) {
    console.error(`Google Sheets API Error (GET) for Sheet ID: [${GOOGLE_SHEET_ID}], Range: [${sheetNameAndRange}]:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch expenses from sheet.';
    return NextResponse.json({ error: `Server error: ${errorMessage}` }, { status: 500 });
  }
}

