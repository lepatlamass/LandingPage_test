import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface SubscriptionStatus {
  isActive: boolean;
  plan?: string;
  expiresAt?: any;
}

const COLLECTION_NAME = 'users';
const SUBCOLLECTION_NAME = 'subscription';
const DOC_ID = 'status';

/**
 * Fetch the subscription status for a user.
 * Path: users/{userId}/subscription/status
 */
export async function getUserSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  if (!userId) return { isActive: false };

  const docRef = doc(db, COLLECTION_NAME, userId, SUBCOLLECTION_NAME, DOC_ID);

  try {
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as SubscriptionStatus;
    }
    return { isActive: false };
  } catch (error) {
    console.error('Error fetching subscription status', error);
    return { isActive: false };
  }
}
