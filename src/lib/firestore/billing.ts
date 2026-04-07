import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface BillingProfile {
  userId: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  phoneNumber?: string;
  country: string;
  postalCode: string;
  state?: string;
  city: string;
  street: string;
  billingEmail: string;
  vatNumber?: string;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

const COLLECTION_NAME = 'users';
const SUBCOLLECTION_NAME = 'billing';
const DOC_ID = 'profile';

/**
 * Fetch a billing profile.
 * Path: users/{userId}/billing/profile
 */
export async function getBillingProfile(userId: string): Promise<Partial<BillingProfile> | null> {
  if (!userId) return null;
  const docRef = doc(db, COLLECTION_NAME, userId, SUBCOLLECTION_NAME, DOC_ID);
  try {
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as Partial<BillingProfile>;
    }
    return null;
  } catch (error) {
    console.error('Error fetching billing profile', error);
    throw error;
  }
}

/**
 * Update or create a billing profile.
 */
export async function updateBillingProfile(userId: string, data: Partial<BillingProfile>) {
  if (!userId) throw new Error('Cannot update billing configuration without a valid user ID.');
  
  const docRef = doc(db, COLLECTION_NAME, userId, SUBCOLLECTION_NAME, DOC_ID);
  
  try {
    const payload = {
      ...data,
      userId,
      updatedAt: serverTimestamp(),
    };
    
    // We add createdAt only if we're creating it initially but given merge:true
    // it's tricky. Safe enough to just rely on updatedAt if not strictly necessary,
    // or you could check if doc exists first.
    
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    console.error('Error updating billing profile', error);
    throw error;
  }
}
