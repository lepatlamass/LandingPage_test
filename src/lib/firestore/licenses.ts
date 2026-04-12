import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface UserLicense {
  licenseKey: string;
  chariowLicenseId: string;
  status: string;
  expiresAt: string;
  activatedAt: string;
  activationCount: number;
  maxActivations: number;
  activationsRemaining: number;
  productName?: string;
  // AI Credits
  aiCreditsTotal: number;
  aiCreditsRemaining: number;
  aiCreditsResetAt: string;
  planType: 'monthly' | 'yearly';
}

/** AI credits per plan type. */
const AI_CREDITS: Record<string, number> = {
  monthly: 10,
  yearly: 20,
};

/** Determine plan type from product name. */
function getPlanType(productName: string): 'monthly' | 'yearly' {
  const lower = productName.toLowerCase();
  if (lower.includes('year')) return 'yearly';
  return 'monthly';
}

/** Calculate the next credit reset date (1 month from now). */
function getNextResetAt(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

/**
 * Store an activated license in the user's Firestore.
 * Path: users/{userId}/licenses/{chariowLicenseId}
 */
export async function saveUserLicense(
  userId: string,
  license: UserLicense
): Promise<void> {
  await setDoc(
    doc(db, 'users', userId, 'licenses', license.chariowLicenseId),
    {
      ...license,
      savedAt: serverTimestamp(),
    }
  );

  // Write a summary doc for fast access checks
  await setDoc(
    doc(db, 'users', userId, 'licenses', 'active'),
    {
      licenseKey: license.licenseKey,
      status: license.status,
      expiresAt: license.expiresAt,
      activationsRemaining: license.activationsRemaining,
      isActive: true,
      aiCreditsTotal: license.aiCreditsTotal,
      aiCreditsRemaining: license.aiCreditsRemaining,
      aiCreditsResetAt: license.aiCreditsResetAt,
      planType: license.planType,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Check if a user has any active license.
 */
export async function getUserLicenseStatus(userId: string): Promise<{
  isActive: boolean;
  licenseKey?: string;
  expiresAt?: string;
  activationsRemaining?: number;
  aiCreditsRemaining?: number;
  aiCreditsTotal?: number;
  planType?: 'monthly' | 'yearly';
}> {
  if (!userId) return { isActive: false };

  const docRef = doc(db, 'users', userId, 'licenses', 'active');

  try {
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      const isExpired =
        data.expiresAt && new Date(data.expiresAt) < new Date();
      return {
        isActive: data.isActive && !isExpired,
        licenseKey: data.licenseKey,
        expiresAt: data.expiresAt,
        activationsRemaining: data.activationsRemaining,
        aiCreditsRemaining: data.aiCreditsRemaining,
        aiCreditsTotal: data.aiCreditsTotal,
        planType: data.planType,
      };
    }
    return { isActive: false };
  } catch (error) {
    console.error('Error fetching license status:', error);
    return { isActive: false };
  }
}

/**
 * Decrement AI credits by 1 when a user uses an AI feature.
 * Returns the new remaining count, or -1 if no credits left.
 */
export async function consumeAICredit(userId: string): Promise<number> {
  const docRef = doc(db, 'users', userId, 'licenses', 'active');

  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return -1;

  const data = snapshot.data();
  if (data.aiCreditsRemaining <= 0) return -1;

  const newRemaining = data.aiCreditsRemaining - 1;
  await setDoc(
    docRef,
    { aiCreditsRemaining: newRemaining },
    { merge: true }
  );

  return newRemaining;
}

/**
 * Add purchased top-up credits to the user's account.
 */
export async function addAICredits(
  userId: string,
  amount: number
): Promise<number> {
  const docRef = doc(db, 'users', userId, 'licenses', 'active');

  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return -1;

  const data = snapshot.data();
  const newTotal = (data.aiCreditsRemaining || 0) + amount;
  await setDoc(docRef, { aiCreditsRemaining: newTotal }, { merge: true });

  return newTotal;
}

/**
 * Get the AI credit allowance for a plan type.
 */
export function getAICreditAllowance(planType: 'monthly' | 'yearly'): number {
  return AI_CREDITS[planType] ?? 10;
}

/**
 * Infer plan type from Chariow product name.
 */
export { getPlanType, getNextResetAt };
