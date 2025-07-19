
// src/app/api/expenses/route.ts
import { google } from 'googleapis';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { Expense, ExpenseCategory } from '@/lib/types';

// Ensure environment variables are loaded
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_RAW = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
const SHEET_NAME = 'DragonSpend';

// --- Helper to set CORS headers ---
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

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
  const sheetNameAndRange = `${SHEET_NAME}!A:E`;
  console.log(`---Sheets API POST--- Attempting to write to Sheet ID: [${GOOGLE_SHEET_ID}] with Range: [${sheetNameAndRange}]`);

  try {
    const sheets = await getSheetsClient();
    const expenseData = (await request.json()) as Omit<Expense, 'id' | 'date'>; 

    if (!expenseData.description || typeof expenseData.amount !== 'number' || !expenseData.category) {
      return new NextResponse(JSON.stringify({ error: 'Missing required expense fields.' }), { 
        status: 400,
        headers: getCorsHeaders(),
      });
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

    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID!, 
      range: sheetNameAndRange, 
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [newExpenseRow],
      },
    });
    
    const savedExpense: Expense = { ...expenseData, id: newId, date };
    return new NextResponse(JSON.stringify(savedExpense), {
      status: 201,
      headers: getCorsHeaders(),
    });

  } catch (error: any) {
    console.error(`Google Sheets API Error (POST) for Sheet ID: [${GOOGLE_SHEET_ID}], Range: [${sheetNameAndRange}]:`, error);
    
    let detailedMessage = 'Failed to add expense to sheet.';
    if (error.code === 404) {
      detailedMessage = `Error 404: "Requested entity was not found." This means the Google Sheet with ID [${GOOGLE_SHEET_ID}] could not be found OR the service account does not have 'Editor' permissions for it. Please verify the Sheet ID and sharing settings.`;
    } else if (error.code === 403) {
      detailedMessage = `Error 403: "The caller does not have permission." This means the Google Sheets API is not enabled in your Google Cloud project or the service account is not configured correctly.`;
    } else if (error.message) {
      detailedMessage = error.message;
    }

    return new NextResponse(JSON.stringify({ error: `Server error: ${detailedMessage}` }), {
      status: 500,
      headers: getCorsHeaders(),
    });
  }
}

// --- GET Handler to fetch all expenses ---
export async function GET() {
  const sheetNameAndRange = `${SHEET_NAME}!A:E`;
  console.log(`---Sheets API GET--- Attempting to read from Sheet ID: [${GOOGLE_SHEET_ID}] with Range: [${sheetNameAndRange}]`);
  
  try {
    const sheets = await getSheetsClient();

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
      return new NextResponse(JSON.stringify(expenses), {
        status: 200,
        headers: getCorsHeaders(),
      });
    } else { 
      return new NextResponse(JSON.stringify([]), {
        status: 200,
        headers: getCorsHeaders(),
      });
    }

  } catch (error: any) {
    console.error(`Google Sheets API Error (GET) for Sheet ID: [${GOOGLE_SHEET_ID}], Range: [${sheetNameAndRange}]:`, error);
    
    let detailedMessage = 'Failed to fetch expenses from sheet.';
    if (error.code === 404) {
      detailedMessage = `Error 404: "Requested entity was not found." This means the Google Sheet with ID [${GOOGLE_SHEET_ID}] could not be found OR the service account does not have 'Editor' permissions for it. Please verify the Sheet ID and sharing settings.`;
    } else if (error.code === 403) {
      detailedMessage = `Error 403: "The caller does not have permission." This means the Google Sheets API is not enabled in your Google Cloud project or the service account is not configured correctly.`;
    } else if (error.message) {
      detailedMessage = error.message;
    }

    return new NextResponse(JSON.stringify({ error: `Server error: ${detailedMessage}` }), {
      status: 500,
      headers: getCorsHeaders(),
    });
  }
}

// --- PUT Handler to update an expense ---
export async function PUT(request: NextRequest) {
    const readRange = `${SHEET_NAME}!A:E`;
    console.log(`---Sheets API PUT--- Attempting to update Sheet ID: [${GOOGLE_SHEET_ID}]`);

    try {
        const sheets = await getSheetsClient();
        const expenseToUpdate = (await request.json()) as Expense;

        if (!expenseToUpdate.id || !expenseToUpdate.description || typeof expenseToUpdate.amount !== 'number' || !expenseToUpdate.category) {
            return new NextResponse(JSON.stringify({ error: 'Missing required fields for update.' }), {
                status: 400,
                headers: getCorsHeaders(),
            });
        }
        
        // 1. Find the row of the expense to update
        const getResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEET_ID!,
            range: readRange,
        });

        const rows = getResponse.data.values;
        if (!rows || rows.length <= 1) {
            throw new Error(`Expense with ID ${expenseToUpdate.id} not found in sheet.`);
        }

        // Find the index of the row with the matching ID. +2 because Sheets are 1-indexed and we skip the header.
        const rowIndex = rows.slice(1).findIndex(row => row[0] === expenseToUpdate.id);
        if (rowIndex === -1) {
             return new NextResponse(JSON.stringify({ error: `Expense with ID ${expenseToUpdate.id} not found.` }), {
                status: 404,
                headers: getCorsHeaders(),
            });
        }
        const sheetRowNumber = rowIndex + 2; 

        // 2. Update the row
        const updateRange = `${SHEET_NAME}!A${sheetRowNumber}:E${sheetRowNumber}`;
        const updatedRowValues = [
            expenseToUpdate.id,
            expenseToUpdate.date,
            expenseToUpdate.description,
            expenseToUpdate.amount,
            expenseToUpdate.category,
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId: GOOGLE_SHEET_ID!,
            range: updateRange,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [updatedRowValues],
            },
        });

        return new NextResponse(JSON.stringify(expenseToUpdate), {
            status: 200,
            headers: getCorsHeaders(),
        });

    } catch (error: any) {
        console.error(`Google Sheets API Error (PUT) for Sheet ID: [${GOOGLE_SHEET_ID}]:`, error);
        
        let detailedMessage = 'Failed to update expense in sheet.';
        if (error.code === 404) {
            detailedMessage = `Error 404: Sheet not found or ID not present.`;
        } else if (error.code === 403) {
            detailedMessage = `Error 403: No permission to edit.`;
        } else if (error.message) {
            detailedMessage = error.message;
        }

        return new NextResponse(JSON.stringify({ error: `Server error: ${detailedMessage}` }), {
            status: 500,
            headers: getCorsHeaders(),
        });
    }
}


// --- OPTIONS Handler for preflight requests ---
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204, // No Content
    headers: getCorsHeaders(),
  });
}
