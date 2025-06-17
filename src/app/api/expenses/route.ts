// src/app/api/expenses/route.ts
import { google } from 'googleapis';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { Expense } from '@/lib/types';

// Ensure environment variables are loaded
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_RAW = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;

// --- Helper function to initialize Google Sheets API client ---
async function getSheetsClient() {
  if (!GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_RAW) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_CREDENTIALS environment variable is not set.');
  }
  if (!GOOGLE_SHEET_ID) {
    throw new Error('GOOGLE_SHEET_ID environment variable is not set.');
  }

  let credentials;
  try {
    credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_RAW);
  } catch (error) {
    console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_CREDENTIALS:', error);
    throw new Error('GOOGLE_SERVICE_ACCOUNT_CREDENTIALS is not valid JSON.');
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
  try {
    const sheets = await getSheetsClient();
    const expenseData = (await request.json()) as Omit<Expense, 'id'>; // Expecting data without an ID

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

    // ** TODO: USER IMPLEMENTATION REQUIRED **
    // Replace 'DragonSpend' with the actual name of your sheet tab.
    // Ensure your sheet has columns in the order: ID, Date, Description, Amount, Category
    // Example:
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'DragonSpend!A:E', // Adjust if your sheet name or columns are different
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [newExpenseRow],
      },
    });

    console.log('--- SIMULATING ADD TO GOOGLE SHEETS (IMPLEMENTATION NEEDED) ---');
    console.log('Spreadsheet ID:', GOOGLE_SHEET_ID);
    console.log('Data to append:', newExpenseRow);
    console.log('Target range: DragonSpend!A:E (Update if needed)');
    console.log('--- END SIMULATION ---');
    
    // For now, return the expense as if it were saved, including the generated ID and date
    const savedExpense: Expense = { ...expenseData, id: newId, date };
    return NextResponse.json(savedExpense, { status: 201 });

  } catch (error) {
    console.error('Google Sheets API Error (POST):', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to add expense to sheet.';
    return NextResponse.json({ error: `Server error: ${errorMessage}` }, { status: 500 });
  }
}

// --- GET Handler to fetch all expenses ---
export async function GET() {
  try {
    const sheets = await getSheetsClient();

    // ** TODO: USER IMPLEMENTATION REQUIRED **
    // Replace 'DragonSpend' with the actual name of your sheet tab.
    // Assumes columns: ID, Date, Description, Amount, Category
    // Example:
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'DragonSpend!A:E', // Adjust if your sheet name or columns are different
    });
    // const rows = response.data.values;
    // if (rows && rows.length > 1) { // Assuming first row is header
    //   const expenses: Expense[] = rows.slice(1).map((row: any[]) => ({
    //     id: row[0],
    //     date: row[1],
    //     description: row[2],
    //     amount: parseFloat(row[3]),
    //     category: row[4] as ExpenseCategory,
    //   }));
    //   return NextResponse.json(expenses);
    // } else {
    //   return NextResponse.json([]); // No data or only header
    // }

    console.log('--- SIMULATING GET FROM GOOGLE SHEETS (IMPLEMENTATION NEEDED) ---');
    console.log('Spreadsheet ID:', GOOGLE_SHEET_ID);
    console.log('Target range: DragonSpend!A:E (Update if needed)');
    console.log('--- END SIMULATION ---');
    
    // For now, return an empty array or mock data
    // Mock data for development until Sheets API is implemented:
    const mockExpenses: Expense[] = [
      // { id: 'mock1', date: new Date(Date.now() - 86400000).toISOString(), description: 'Mock Yesterday Coffee', amount: 3.50, category: 'Outside Food' },
      // { id: 'mock2', date: new Date().toISOString(), description: 'Mock Today Lunch', amount: 12.75, category: 'Outside Food' },
      // { id: 'mock3', date: new Date(Date.now() - (86400000 * 5)).toISOString(), description: 'Mock Groceries', amount: 55.20, category: 'Groceries' },
    ];
    return NextResponse.json(mockExpenses);


  } catch (error) {
    console.error('Google Sheets API Error (GET):', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch expenses from sheet.';
    return NextResponse.json({ error: `Server error: ${errorMessage}` }, { status: 500 });
  }
}
