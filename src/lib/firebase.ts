
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Ensure environment variables are loaded
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

// --- Firebase Configuration Values Read by Next.js ---
// The following logs will appear in your SERVER terminal (where you run `npm run dev`).
// Review these carefully to see what values Next.js is actually using.
console.log('--- Firebase Configuration Check (src/lib/firebase.ts) ---');
console.log(`Attempting to load Firebase config. Values as seen by Next.js:`);
console.log(`1. NEXT_PUBLIC_FIREBASE_API_KEY (Server Value): "${apiKey}"`);
console.log(`2. NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN (Server Value): "${authDomain}"`);
console.log(`3. NEXT_PUBLIC_FIREBASE_PROJECT_ID (Server Value): "${projectId}"`);
console.log(`4. NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET (Server Value): "${storageBucket}"`);
console.log(`5. NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID (Server Value): "${messagingSenderId}"`);
console.log(`6. NEXT_PUBLIC_FIREBASE_APP_ID (Server Value): "${appId}"`);
console.log('--- End of Firebase Configuration Check ---');

if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
  const detailedErrorMessage = `
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!! FIREBASE CONFIGURATION ERROR (from src/lib/firebase.ts)                       !!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
One or more Firebase environment variables are missing or empty.
This is critical for the app to connect to Firebase.

>> PLEASE CHECK YOUR SERVER CONSOLE (where you ran 'npm run dev') <<
   The logs just above this error message (starting with "--- Firebase Configuration Check ---")
   show the exact values (or "undefined") that Next.js is currently seeing for each
   NEXT_PUBLIC_FIREBASE_ variable.

TROUBLESHOOTING STEPS:
1.  VERIFY .env FILE:
    a.  LOCATION: Ensure a file named exactly '.env' exists at the VERY ROOT of your project
        (the same directory as 'package.json', NOT inside 'src/').
    b.  NAMING: The file must be '.env'.
    c.  PREFIXES: ALL Firebase variables in your .env file MUST start with 'NEXT_PUBLIC_'.
        Example: NEXT_PUBLIC_FIREBASE_API_KEY="your_value_here"
    d.  VALUES: Ensure you've replaced placeholder values with your ACTUAL Firebase project credentials.
        Find them in your Firebase Console: Project Settings > General > Your apps > Web app.
    e.  NO TYPOS: Double-check variable names and values for typos.

2.  RESTART SERVER:
    After creating or making ANY changes to your .env file, you MUST completely
    STOP and RESTART your Next.js development server (e.g., Ctrl+C, then 'npm run dev').
    Next.js only loads .env variables on startup.

Current values that caused this error (if "undefined", it means the variable was not found/loaded by Next.js):
  - API Key (Server Value): "${apiKey}"
  - Auth Domain (Server Value): "${authDomain}"
  - Project ID (Server Value): "${projectId}"
  - Storage Bucket (Server Value): "${storageBucket}"
  - Messaging Sender ID (Server Value): "${messagingSenderId}"
  - App ID (Server Value): "${appId}"
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  `;
  console.error(detailedErrorMessage); // This detailed message will now appear in your SERVER console.
  throw new Error(
    'Firebase configuration is critically missing or incomplete. See detailed error in console. Check .env file setup and ensure server was restarted after changes.'
  );
}

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
