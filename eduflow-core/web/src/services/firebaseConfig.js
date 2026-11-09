// Firebase configuration for the EduFlow application
// This enables real-time features, authentication, and analytics

import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, logEvent } from 'firebase/analytics';

const getEnv = (key, fallback = '') => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  return fallback;
};

// Firebase configuration
const firebaseConfig = {
  apiKey: getEnv('REACT_APP_FIREBASE_API_KEY', 'demo-api-key'),
  authDomain: getEnv('REACT_APP_FIREBASE_AUTH_DOMAIN', 'eduflow-demo.firebaseapp.com'),
  projectId: getEnv('REACT_APP_FIREBASE_PROJECT_ID', 'eduflow-demo'),
  storageBucket: getEnv('REACT_APP_FIREBASE_STORAGE_BUCKET', 'eduflow-demo.appspot.com'),
  messagingSenderId: getEnv('REACT_APP_FIREBASE_MESSAGING_SENDER_ID', 'demo-sender-id'),
  appId: getEnv('REACT_APP_FIREBASE_APP_ID', 'demo-app-id'),
  measurementId: getEnv('REACT_APP_FIREBASE_MEASUREMENT_ID', 'demo-measurement-id')
};

// Initialize Firebase
let app;
let auth;
let db;
let storage;
let analytics;

const isRealConfig = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'demo-api-key';

try {
  if (isRealConfig) {
    app = initializeApp(firebaseConfig);
    
    // Initialize Authentication
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence).catch(() => {});
    
    // Initialize Firestore
    db = getFirestore(app);
    enableIndexedDbPersistence(db).catch(() => {});
    
    // Initialize Storage
    storage = getStorage(app);
    
    // Initialize Analytics
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }
  }
} catch (_error) {
  // Silent fail in dev/demo when real Firebase is not provisioned
}

// Export services
export { app, auth, db, storage, analytics };

// Utility function to log events
export const logCustomEvent = (eventName, eventData = {}) => {
  try {
    if (analytics) {
      logEvent(analytics, eventName, eventData);
    }
  } catch (error) {
    console.error('Error logging event:', error);
  }
};

// Custom hooks and utilities for Firebase
export const isFirebaseInitialized = () => {
  return !!(app && auth && db && storage);
};
