import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/* ─────────────────────────────────────────── */
/* AI Solution IDs                             */
/* ─────────────────────────────────────────── */

export const AI_SOLUTION_IDS = [
  'bg-remover',
  'watermark-remover',
  'image-to-text',
] as const;

export type AISolutionId = (typeof AI_SOLUTION_IDS)[number];

export interface AIToolCredits {
  remaining: number;
  total: number;
}

export type PerToolCredits = Record<AISolutionId, AIToolCredits>;

/** Human-readable labels for each AI solution (used in UI). */
export const AI_SOLUTION_META: Record<
  AISolutionId,
  { label: string; icon: string; color: string }
> = {
  'bg-remover':        { label: 'Background Remover', icon: 'eraser',   color: '#d4ff33' },
  'watermark-remover': { label: 'Watermark Remover',  icon: 'droplets', color: '#33d4ff' },
  'image-to-text':     { label: 'Image to Text (OCR)',icon: 'type',     color: '#ff8533' },
};

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
  // Aggregate AI Credits (kept for backward compat)
  aiCreditsTotal: number;
  aiCreditsRemaining: number;
  aiCreditsResetAt: string;
  planType: 'monthly' | 'yearly';
  // Per-tool AI Credits
  perToolCredits?: PerToolCredits;
}

/** AI credits per plan type (per AI solution). */
const AI_CREDITS: Record<string, number> = {
  monthly: 10,
  yearly: 20,
};

/** Build initial per-tool credits for a plan type. */
export function buildInitialPerToolCredits(
  planType: 'monthly' | 'yearly'
): PerToolCredits {
  const amount = AI_CREDITS[planType] ?? 10;
  const credits = {} as PerToolCredits;
  for (const id of AI_SOLUTION_IDS) {
    credits[id] = { remaining: amount, total: amount };
  }
  return credits;
}

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
  // Build per-tool credits if not provided
  const perToolCredits =
    license.perToolCredits ?? buildInitialPerToolCredits(license.planType);

  await setDoc(
    doc(db, 'users', userId, 'licenses', license.chariowLicenseId),
    {
      ...license,
      perToolCredits,
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
      perToolCredits,
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
  perToolCredits?: PerToolCredits;
}> {
  if (!userId) return { isActive: false };

  const docRef = doc(db, 'users', userId, 'licenses', 'active');

  try {
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      const isExpired =
        data.expiresAt && new Date(data.expiresAt) < new Date();

      // Backfill perToolCredits if missing but planType exists (legacy licenses)
      let perToolCredits = data.perToolCredits;
      if (!perToolCredits && data.planType) {
        perToolCredits = buildInitialPerToolCredits(data.planType);
        // Write the backfilled data to Firestore so we don't do this every time
        await setDoc(
          docRef,
          { perToolCredits },
          { merge: true }
        );
      }

      return {
        isActive: data.isActive && !isExpired,
        licenseKey: data.licenseKey,
        expiresAt: data.expiresAt,
        activationsRemaining: data.activationsRemaining,
        aiCreditsRemaining: data.aiCreditsRemaining,
        aiCreditsTotal: data.aiCreditsTotal,
        planType: data.planType,
        perToolCredits: perToolCredits ?? undefined,
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
/**
 * Decrement AI credits by 1 for a specific tool.
 * Returns the new remaining count, or -1 if no credits left.
 */
export async function consumeAICredit(
  userId: string,
  toolId?: AISolutionId
): Promise<number> {
  const docRef = doc(db, 'users', userId, 'licenses', 'active');

  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    console.warn(`[consumeAICredit] No license document found for user ${userId}`);
    return -1;
  }

  const data = snapshot.data();


  // Per-tool credit decrement (preferred)
  if (toolId && data.perToolCredits?.[toolId]) {
    const toolCredits = data.perToolCredits[toolId];

    if (toolCredits.remaining <= 0) {
      console.warn(`[consumeAICredit] No credits left for ${toolId}`);
      return -1;
    }

    const newRemaining = toolCredits.remaining - 1;
    const updatedPerTool = {
      ...data.perToolCredits,
      [toolId]: { ...toolCredits, remaining: newRemaining },
    };

    // Also decrement the aggregate counter
    const newAggRemaining = Math.max((data.aiCreditsRemaining ?? 0) - 1, 0);
    await setDoc(
      docRef,
      {
        perToolCredits: updatedPerTool,
        aiCreditsRemaining: newAggRemaining,
      },
      { merge: true }
    );


    return newRemaining;
  }



  // Fallback: aggregate-only (legacy)
  if (data.aiCreditsRemaining <= 0) {
    console.warn(`[consumeAICredit] No aggregate credits left`);
    return -1;
  }
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

/**
 * Reset credits if the billing period has elapsed.
 * Checks `aiCreditsResetAt` against the current date.
 * If expired, resets per-tool and aggregate credits based on plan type.
 * Returns the updated credits data, or null if no reset was needed.
 */
export async function resetCreditsIfNeeded(
  userId: string
): Promise<{
  aiCreditsRemaining: number;
  aiCreditsTotal: number;
  aiCreditsResetAt: string;
  perToolCredits: PerToolCredits;
} | null> {
  const docRef = doc(db, 'users', userId, 'licenses', 'active');
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data();

  // Backfill perToolCredits if missing but planType exists (legacy fix)
  if (!data.perToolCredits && data.planType) {

    const creditAmount = AI_CREDITS[data.planType] ?? 10;
    const newPerToolCredits = buildInitialPerToolCredits(data.planType);
    const newTotalCredits = creditAmount * AI_SOLUTION_IDS.length;

    await setDoc(
      docRef,
      {
        perToolCredits: newPerToolCredits,
        aiCreditsRemaining: data.aiCreditsRemaining ?? newTotalCredits,
        aiCreditsTotal: data.aiCreditsTotal ?? newTotalCredits,
        aiCreditsResetAt: data.aiCreditsResetAt || getNextResetAt(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return {
      aiCreditsRemaining: data.aiCreditsRemaining ?? newTotalCredits,
      aiCreditsTotal: data.aiCreditsTotal ?? newTotalCredits,
      aiCreditsResetAt: data.aiCreditsResetAt || getNextResetAt(),
      perToolCredits: newPerToolCredits,
    };
  }

  // Check if reset period has passed
  if (!data.aiCreditsResetAt) return null;
  const resetDate = new Date(data.aiCreditsResetAt);
  if (resetDate > new Date()) return null; // Not yet time to reset

  // Calculate new credits
  const planType = data.planType || 'monthly';
  const creditAmount = AI_CREDITS[planType] ?? 10;
  const newPerToolCredits = buildInitialPerToolCredits(planType);
  const newTotalCredits = creditAmount * AI_SOLUTION_IDS.length;

  // Update Firestore
  await setDoc(
    docRef,
    {
      aiCreditsRemaining: newTotalCredits,
      aiCreditsTotal: newTotalCredits,
      aiCreditsResetAt: getNextResetAt(),
      perToolCredits: newPerToolCredits,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return {
    aiCreditsRemaining: newTotalCredits,
    aiCreditsTotal: newTotalCredits,
    aiCreditsResetAt: getNextResetAt(),
    perToolCredits: newPerToolCredits,
  };
}
