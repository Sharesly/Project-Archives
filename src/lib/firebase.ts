/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  firestoreDatabaseId?: string;
}

// 1. Try environment variables first (Vercel/GitHub)
let firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)',
};

// 2. Fallback to local config file (AI Studio)
if (!firebaseConfig.apiKey) {
  const configModules = import.meta.glob<{ default?: FirebaseConfig } & FirebaseConfig>(
    '../../firebase-applet-config.json',
    { eager: true }
  );
  const moduleKeys = Object.keys(configModules);
  if (moduleKeys.length > 0) {
    const mod = configModules[moduleKeys[0]];
    firebaseConfig = (mod.default ?? mod) as FirebaseConfig;
  } else {
    console.error('Firebase configuration missing. Please set VITE_FIREBASE_* environment variables.');
  }
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
