import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { UserPreferences } from '../../types/user-preferences';

const COLLECTION_NAME = 'users';
const SUBCOLLECTION_NAME = 'preferences';
const DOC_ID = 'settings';

/**
 * Fetch a user's preferences profile.
 * Path: users/{userId}/preferences/settings
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  if (!userId) return null;
  const docRef = doc(db, COLLECTION_NAME, userId, SUBCOLLECTION_NAME, DOC_ID);
  
  try {
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as UserPreferences;
    }
    // Return a default structure if not found
    return {
      userId,
      emailNotifications: { promotional: true }
    };
  } catch (error) {
    console.error('Error fetching settings profile', error);
    throw error;
  }
}

/**
 * Update email notification preference.
 */
export async function updateEmailPreferences(userId: string, promotional: boolean): Promise<void> {
  if (!userId) throw new Error('Cannot update settings without a valid user ID.');
  
  const docRef = doc(db, COLLECTION_NAME, userId, SUBCOLLECTION_NAME, DOC_ID);
  
  try {
    const payload = {
      userId,
      updatedAt: serverTimestamp(),
      emailNotifications: {
        promotional
      }
    };
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    console.error('Error updating email preferences', error);
    throw error;
  }
}
