import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Ensure environment variables are loaded
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

// Diagnostic logs
console.log('Firebase Environment Variables Check (from src/lib/firebase.ts):');
console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', apiKey);
console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', authDomain);
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', projectId);
console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:', storageBucket);
console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:', messagingSenderId);
console.log('NEXT_PUBLIC_FIREBASE_APP_ID:', appId);

if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
  console.error('Firebase configuration is missing or incomplete. Check .env file and server restart.');
  throw new Error(
    'Firebase configuration is missing. Please ensure all NEXT_PUBLIC_FIREBASE_* environment variables are set in your .env file. These variables should be prefixed with NEXT_PUBLIC_ to be available on the client side.'
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
