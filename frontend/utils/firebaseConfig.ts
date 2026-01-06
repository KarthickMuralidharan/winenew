import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration - Replace with your actual Firebase project config
// You can get this from Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "demo-app-id"
};

// Initialize Firebase App (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
