import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const apps = getApps();

if (apps.length === 0) {
  try {
    initializeApp();
  } catch (error) {
    console.warn('[FirebaseAdmin] Failed to initializeApp with ADC, falling back to projectId:', error);
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
}

export const dbAdmin = getFirestore();
