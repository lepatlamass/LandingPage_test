# Chariow License Integration Proposal

## Overview

This document outlines how to integrate **Chariow's hosted checkout + license system** into your existing Next.js app (`refinedocs`). The key principle is **minimal disruption**: we reuse your existing account/subscription page design and landing page pricing section, wiring up the Chariow flow without creating new pages or breaking the current UI.

**Key principle:** The license *is* the access control. No webhooks. No subscription tracking. Buy → Get Key → Activate → Access.

---

## AI Credits System

Each plan includes a monthly AI credit allowance. One credit = one use of any AI-powered feature (background remover, AI tools, etc.).

| Plan | AI Credits | Renewal |
|---|---|---|
| **Monthly** | 10 credits/month | Resets each month |
| **Yearly** | 20 credits/month (240/year) | Resets each month during the year |

**Top-up product:** When users run out of credits, they can buy additional AI credit packs:
- **Checkout URL:** `https://lgcvrlya.mychariow.shop/prd_6zbaau`
- Monthly users buy a monthly top-up pack
- Yearly users buy a yearly top-up pack (same product, different context)

**Credit tracking:** Firestore stores the user's remaining credits. Each AI feature use decrements the counter. A visual progress bar on the subscription page and in the AI gate modal shows remaining credits.

---

## Current Architecture Summary

| Component | Implementation |
|---|---|
| **Auth** | Firebase Google Sign-In (`AuthProvider`) |
| **Access Control** | Currently: `users/{userId}/subscription/status` (Firestore) |
| **Auth Context** | `{ user, loading, isSubscribed }` — available via `useAuth()` |
| **AI Credits** | Tracked in `users/{userId}/licenses/active` → `aiCreditsRemaining`, `aiCreditsTotal` |
| **Plans** | Monthly & Yearly licenses (already created in Chariow) |
| **Top-up Credits** | `https://lgcvrlya.mychariow.shop/prd_6zbaau` |
| **Subscription page** | `/[locale]/account/subscription` — shows "No Active Subscription" with dead button |
| **Pricing section** | Inline in `/[locale]/page.tsx` (`id="price"` section) — two cards with dead buttons |

---

## What We Reuse (No New Pages)

| Existing | What happens |
|---|---|
| `/[locale]/account/subscription/page.tsx` | **Repurposed** as the license activation page. Same dark design, same layout, just wired to Chariow |
| `/[locale]/page.tsx` pricing section | **Buttons wired up** to open Chariow checkout URLs |
| `AccountSidebar` nav | Stays as-is ("Subscription" label unchanged) |
| Gate modals (`AIGateModal`, `DownloadGateModal`) | Already redirect to `/account/subscription` — works perfectly |

**No new pages created.** No new routes added. Everything plugs into what already exists.

---

## Simplified User Flow

```
┌──────────────────────────────────────────────────────┐
│                   License-Only Flow                   │
├──────────────────────────────────────────────────────┤
│                                                       │
│  1. User sees pricing on landing page (/)             │
│  2. Clicks "Start Monthly Plan" or "Get Yearly"       │
│  3. Opens Chariow hosted checkout in new tab          │
│  4. Completes payment → receives license key          │
│  5. Returns to app → goes to /account/subscription    │
│     (same page they already see in sidebar)           │
│  6. Enters license key → validates & activates        │
│  7. License stored in Firestore with AI credits       │
│     (Monthly: 10/mo  |  Yearly: 20/mo)                │
│  8. User uses AI features → credits decrement         │
│  9. Credits run low → "Buy More Credits" button       │
│     opens https://lgcvrlya.mychariow.shop/prd_6zbaau  │
│                                                       │
└──────────────────────────────────────────────────────┘
```

No webhooks. No recurring billing. No new routes. No breaking changes.

---

## Files to Create

```
src/
├── lib/
│   ├── chariow.ts                  # Chariow API client (server-side only)
│   └── firestore/licenses.ts       # License CRUD helpers for Firestore
├── app/
│   └── api/
│       └── licenses/
│           ├── activate/route.ts   # POST — activate a license key
│           └── validate/route.ts   # POST — validate a key (pre-activate check)
├── components/
│   └── billing/
│       └── LicenseActivation.tsx   # License key input + activate button (dark theme)
```

**Files to Modify (not replace):**

| File | Change |
|---|---|
| `src/app/[locale]/account/subscription/page.tsx` | Wire up `LicenseActivation` component; keep existing design |
| `src/app/[locale]/page.tsx` | Wire pricing buttons to Chariow checkout URLs |
| `src/providers/AuthProvider.tsx` | Replace `isSubscribed` with `hasActiveLicense` |
| `messages/*.json` (all 6 locales) | Add i18n keys for activation UI |

---

## Step-by-Step Implementation

### Phase 1: Environment Variables

Add to `.env.local`:

```env
# Chariow API (server-side only — never exposed to client)
CHARIOW_API_KEY=your_chariow_api_key

# Chariow hosted checkout URLs (client-facing)
NEXT_PUBLIC_CHARIOW_YEARLY_CHECKOUT=https://lgcvrlya.mychariow.shop/prd_ge7e1g
NEXT_PUBLIC_CHARIOW_MONTHLY_CHECKOUT=https://lgcvrlya.mychariow.shop/prd_zvd1cf
NEXT_PUBLIC_CHARIOW_CREDITS_CHECKOUT=https://lgcvrlya.mychariow.shop/prd_6zbaau
```

---

### Phase 2: Chariow API Client (Server-Side)

**File:** `src/lib/chariow.ts`

```ts
const CHARIOW_BASE_URL = 'https://api.chariow.com/v1';
const API_KEY = process.env.CHARIOW_API_KEY;

if (!API_KEY) {
  throw new Error('CHARIOW_API_KEY is not set');
}

export interface ActivateLicenseResponse {
  message: string;
  data: {
    id: string;
    license_key: string;
    status: string;          // 'active' | 'pending_activation' | 'expired' | 'revoked'
    activated_at: string;    // ISO 8601
    expires_at: string;      // ISO 8601
    activation_count: number;
    max_activations: number;
    activations_remaining: number;
    is_active: boolean;
    can_activate: boolean;
    product: { id: number; name: string };
  };
  errors: string[];
}

/**
 * Activate a license key via Chariow API.
 * Server-side only — never call from client components.
 */
export async function activateLicense(
  licenseKey: string,
  deviceIdentifier?: string
): Promise<ActivateLicenseResponse> {
  const res = await fetch(
    `${CHARIOW_BASE_URL}/licenses/${licenseKey}/activate`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ device_identifier: deviceIdentifier }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.errors?.[0] || `Chariow API error: ${res.status}`
    );
  }

  return res.json();
}

/**
 * Validate a license key without activating it.
 * Checks if the key exists, is not expired/revoked, and can be activated.
 */
export async function validateLicense(licenseKey: string) {
  const res = await fetch(
    `${CHARIOW_BASE_URL}/licenses/${licenseKey}`,
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    }
  );

  if (!res.ok) {
    return { isValid: false, error: 'Invalid license key' };
  }

  const data = await res.json();
  const license = data.data;

  // Check if license is usable
  if (license.status === 'revoked') {
    return { isValid: false, error: 'This license has been revoked' };
  }
  if (license.status === 'expired' || new Date(license.expires_at) < new Date()) {
    return { isValid: false, error: 'This license has expired' };
  }
  if (!license.can_activate && license.status === 'pending_activation') {
    return { isValid: false, error: 'License cannot be activated' };
  }

  return {
    isValid: true,
    data: {
      productName: license.product?.name,
      expiresAt: license.expires_at,
      maxActivations: license.max_activations,
      activationsRemaining: license.activations_remaining,
    },
  };
}
```

---

### Phase 3: API Routes

**File:** `src/app/api/licenses/activate/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server';
import { activateLicense } from '@/lib/chariow';
import { saveUserLicense } from '@/lib/firestore/licenses';

export async function POST(req: NextRequest) {
  try {
    const { licenseKey, userId } = await req.json();

    if (!licenseKey) {
      return NextResponse.json(
        { error: 'License key is required' },
        { status: 400 }
      );
    }
    if (!userId) {
      return NextResponse.json(
        { error: 'You must be logged in to activate a license' },
        { status: 401 }
      );
    }

    // Step 1: Call Chariow to activate the license
    const result = await activateLicense(licenseKey);

    // Step 2: Store the activated license in the user's Firestore
    await saveUserLicense(userId, {
      licenseKey: result.data.license_key,
      chariowLicenseId: result.data.id,
      status: result.data.status,
      expiresAt: result.data.expires_at,
      activatedAt: new Date().toISOString(),
      activationCount: result.data.activation_count,
      maxActivations: result.data.max_activations,
      activationsRemaining: result.data.activations_remaining,
      productName: result.data.product?.name,
    });

    return NextResponse.json({
      message: 'License activated successfully',
      data: {
        expiresAt: result.data.expires_at,
        productName: result.data.product?.name,
        activationsRemaining: result.data.activations_remaining,
      },
    });
  } catch (error: any) {
    console.error('License activation error:', error);
    return NextResponse.json(
      { error: error.message || 'Activation failed' },
      { status: 400 }
    );
  }
}
```

**File:** `src/app/api/licenses/validate/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server';
import { validateLicense } from '@/lib/chariow';

export async function POST(req: NextRequest) {
  try {
    const { licenseKey } = await req.json();

    if (!licenseKey) {
      return NextResponse.json(
        { error: 'License key is required' },
        { status: 400 }
      );
    }

    const result = await validateLicense(licenseKey);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Validation failed' },
      { status: 400 }
    );
  }
}
```

---

### Phase 4: Firestore License Helpers

**File:** `src/lib/firestore/licenses.ts`

```ts
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
  aiCreditsTotal: number;        // total credits for this period (10 or 20)
  aiCreditsRemaining: number;    // credits left this period
  aiCreditsResetAt: string;      // ISO 8601 — when credits next reset
  planType: 'monthly' | 'yearly';
}

/**
 * AI credits per plan type.
 */
const AI_CREDITS: Record<string, number> = {
  monthly: 10,
  yearly: 20,
};

/**
 * Determine plan type from product name.
 */
function getPlanType(productName: string): 'monthly' | 'yearly' {
  const lower = productName.toLowerCase();
  if (lower.includes('year')) return 'yearly';
  return 'monthly';
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

  // Also write a summary doc for quick access checks
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
      // Check if license is still valid (not expired)
      const isExpired = data.expiresAt && new Date(data.expiresAt) < new Date();
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
  await setDoc(docRef, { aiCreditsRemaining: newRemaining }, { merge: true });

  return newRemaining;
}

/**
 * Add purchased top-up credits to the user's account.
 * Called after the user buys a credit pack from Chariow.
 */
export async function addAICredits(userId: string, amount: number): Promise<number> {
  const docRef = doc(db, 'users', userId, 'licenses', 'active');

  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return -1;

  const data = snapshot.data();
  const newTotal = (data.aiCreditsRemaining || 0) + amount;
  await setDoc(docRef, { aiCreditsRemaining: newTotal }, { merge: true });

  return newTotal;
}
```

---

### Phase 5: License Activation Component (Dark Theme)

This component matches your existing subscription page design (`zinc-900` backgrounds, `#d4ff33` accent color, rounded-2xl cards).

**File:** `src/components/billing/LicenseActivation.tsx`

```tsx
'use client';

import { useState } from 'react';
import { Key, Loader2, CheckCircle, CreditCard, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useTranslations } from 'next-intl';

const CREDITS_CHECKOUT = process.env.NEXT_PUBLIC_CHARIOW_CREDITS_CHECKOUT || '#';

interface CreditsDisplayProps {
  remaining: number;
  total: number;
}

export function AICreditsBar({ remaining, total }: CreditsDisplayProps) {
  const pct = Math.round((remaining / total) * 100);
  const isLow = remaining <= 3;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="text-[#d4ff33] h-5 w-5" />
          <h2 className="text-lg font-semibold text-white">AI Credits</h2>
        </div>
        <span className={`text-sm font-bold ${isLow ? 'text-amber-400' : 'text-[#d4ff33]'}`}>
          {remaining} / {total}
        </span>
      </div>

      <div className="p-6 space-y-3">
        {/* Progress bar */}
        <div className="w-full bg-zinc-950 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isLow ? 'bg-amber-400' : 'bg-[#d4ff33]'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">
            {remaining === 0
              ? 'No credits remaining'
              : `${remaining} credit${remaining !== 1 ? 's' : ''} left`}
          </span>
          {remaining <= 5 && remaining > 0 && (
            <span className="text-amber-400 font-medium flex items-center gap-1">
              <Zap className="w-3 h-3" /> Running low
            </span>
          )}
        </div>

        {/* Buy more credits button */}
        <button
          onClick={() => window.open(CREDITS_CHECKOUT, '_blank')}
          className="w-full py-3 rounded-xl bg-zinc-800 text-white font-bold text-sm hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-[#d4ff33]" />
          Buy More Credits
        </button>
      </div>
    </div>
  );
}

export default function LicenseActivation() {
  const t = useTranslations('Account.pages.subscription');
  const { user } = useAuth();
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [licenseInfo, setLicenseInfo] = useState<{
    productName: string;
    expiresAt: string;
  } | null>(null);

  const handleValidate = async () => {
    if (!licenseKey) return;
    setValidating(true);
    setError(null);

    try {
      const res = await fetch('/api/licenses/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey }),
      });

      const data = await res.json();

      if (!res.ok || !data.isValid) {
        setError(data.error || 'Invalid license key');
        setLicenseInfo(null);
        return;
      }

      setLicenseInfo({
        productName: data.data.productName,
        expiresAt: new Date(data.data.expiresAt).toLocaleDateString(),
      });
    } catch {
      setError('Validation failed. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/licenses/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey, userId: user?.uid }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Activation failed');
      }

      setSuccess(true);
      setLicenseInfo({
        productName: data.data.productName,
        expiresAt: new Date(data.data.expiresAt).toLocaleDateString(),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center gap-3">
          <CreditCard className="text-[#d4ff33] h-5 w-5" />
          <h2 className="text-lg font-semibold text-white">Current Plan</h2>
        </div>
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="text-[#d4ff33] h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">License Activated</h3>
          {licenseInfo && (
            <>
              <p className="text-zinc-400 mb-1">
                {licenseInfo.productName} — Valid until {licenseInfo.expiresAt}
              </p>
              <p className="text-[#d4ff33] text-sm font-medium">
                {licenseInfo.aiCreditsRemaining} AI credits included
              </p>
            </>
          )}
          <p className="text-zinc-500 text-sm mt-2">
            You have full access to all features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-800 flex items-center gap-3">
        <Key className="text-zinc-500 h-5 w-5" />
        <h2 className="text-lg font-semibold text-white">{t('activateLicense')}</h2>
      </div>

      <form onSubmit={handleActivate} className="p-6 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => {
                setLicenseKey(e.target.value);
                setError(null);
                setLicenseInfo(null);
              }}
              onBlur={() => {
                if (licenseKey.length > 8) handleValidate();
              }}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-[#d4ff33]/30 focus:border-[#d4ff33] outline-none font-mono uppercase text-sm"
              required
            />
          </div>
        </div>

        {licenseInfo && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300">
            <span className="text-[#d4ff33] font-semibold">{licenseInfo.productName}</span> — Valid until {licenseInfo.expiresAt}
          </div>
        )}

        {error && (
          <div className="text-red-400 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading || validating || !licenseKey}
          className="w-full py-3 rounded-xl bg-[#d4ff33] text-black font-bold text-sm hover:bg-[#c2eb2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('activating')}
            </>
          ) : (
            <>
              <Key className="w-4 h-4" />
              {t('activateLicenseButton')}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
```

---

### Phase 6: Wire Up Existing Subscription Page

**File:** `src/app/[locale]/account/subscription/page.tsx` (modified, not replaced)

The page keeps its existing structure and design. Two states:

1. **No active license** → shows the existing "No Active Subscription" card + `LicenseActivation` form
2. **Active license** → shows license details

```tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { CreditCard, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/providers/AuthProvider';
import { Link } from '../../../../navigation';
import LicenseActivation, { AICreditsBar } from '@/components/billing/LicenseActivation';

export default function SubscriptionPage() {
  const t = useTranslations('Account.pages.subscription');
  const { user, loading, hasActiveLicense, aiCreditsRemaining, aiCreditsTotal } = useAuth();

  if (loading) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t('title')}</h1>
        <p className="text-zinc-400">Manage your plan and billing.</p>
      </div>

      <div className="space-y-6">
        {/* Info Box (Callout) — unchanged */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden p-6"
        >
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="space-y-2 flex-1">
              <h3 className="text-lg font-semibold text-white">Upgrade to Team Plan</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {t('teamPlanInfo')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Link
                href="#"
                className="text-sm font-medium text-[#d4ff33] hover:text-[#c2eb2e] hover:underline transition-colors flex items-center justify-center pt-2 sm:pt-0"
              >
                {t('tellYourBoss')}
              </Link>
              <Link
                href="#"
                className="inline-flex items-center justify-center gap-2 bg-zinc-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-zinc-700 transition-colors"
              >
                {t('switchToTeamPlan')}
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Subscription Status Card */}
        {hasActiveLicense ? (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <LicenseActivation />
            </motion.div>

            {/* AI Credits Usage Bar */}
            {aiCreditsRemaining !== undefined && aiCreditsTotal !== undefined && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <AICreditsBar remaining={aiCreditsRemaining} total={aiCreditsTotal} />
              </motion.div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* "No Active Subscription" card — existing design, unchanged */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-zinc-800 flex items-center gap-3">
                <CreditCard className="text-zinc-500 h-5 w-5" />
                <h2 className="text-lg font-semibold text-white">Current Plan</h2>
              </div>

              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="text-zinc-500 h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Active Subscription</h3>
                <p className="text-zinc-400 mb-8 max-w-sm">
                  {t('noSubscription')}
                </p>

                {/* This button now scrolls to the activation form below */}
                <a
                  href="#activate-form"
                  className="inline-flex items-center justify-center gap-2 bg-[#d4ff33] text-black px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#c2eb2e] transition-colors active:scale-[0.98]"
                >
                  {t('tryFree')} <ArrowRight size={16} />
                </a>
              </div>
            </div>

            {/* License Activation Form */}
            <div id="activate-form">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <LicenseActivation />
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### Phase 7: Wire Up Landing Page Pricing Buttons

In the existing pricing section of `src/app/[locale]/page.tsx`, we just add `onClick` handlers to the two plan buttons. No design changes.

**Modify the two buttons in the pricing section:**

```tsx
// Monthly plan button — replace the existing button line:
<button
  onClick={() => {
    if (!user) {
      router.push(`/login?redirect=/#price`);
    } else {
      window.open(process.env.NEXT_PUBLIC_CHARIOW_MONTHLY_CHECKOUT, '_blank');
    }
  }}
  className="w-full py-4 rounded-xl bg-[#d4ff33] text-black font-black text-base hover:bg-[#bce622] transition-all hover:scale-[1.02] active:scale-[0.98]"
>
  {t('startMonthly')}
</button>

// Yearly plan button — replace the existing button line:
<button
  onClick={() => {
    if (!user) {
      router.push(`/login?redirect=/#price`);
    } else {
      window.open(process.env.NEXT_PUBLIC_CHARIOW_YEARLY_CHECKOUT, '_blank');
    }
  }}
  className="w-full py-4 rounded-xl bg-[#2a2d35] text-white font-black text-base hover:bg-[#353943] transition-all hover:scale-[1.02] active:scale-[0.98]"
>
  {t('getYearly')}
</button>
```

To make this work, add these imports/usage at the top of the page component:

```tsx
'use client';  // page is already 'use client'

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from '@/navigation';

// Inside the page component:
const { user } = useAuth();
const router = useRouter();
```

---

### Phase 8: Update AuthProvider

Replace `isSubscribed` with `hasActiveLicense`.

**File:** `src/providers/AuthProvider.tsx` (modified)

```tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUserLicenseStatus } from '../lib/firestore/licenses';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasActiveLicense: boolean;  // was: isSubscribed
  aiCreditsRemaining?: number;
  aiCreditsTotal?: number;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  hasActiveLicense: false,
  aiCreditsRemaining: undefined,
  aiCreditsTotal: undefined,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveLicense, setHasActiveLicense] = useState(false);
  const [aiCreditsRemaining, setAICreditsRemaining] = useState<number | undefined>();
  const [aiCreditsTotal, setAICreditsTotal] = useState<number | undefined>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('refinedocs_has_logged_in', 'true');
        }
        const licenseStatus = await getUserLicenseStatus(firebaseUser.uid);
        setHasActiveLicense(licenseStatus.isActive);
        setAICreditsRemaining(licenseStatus.aiCreditsRemaining);
        setAICreditsTotal(licenseStatus.aiCreditsTotal);
      } else {
        setHasActiveLicense(false);
        setAICreditsRemaining(undefined);
        setAICreditsTotal(undefined);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, hasActiveLicense, aiCreditsRemaining, aiCreditsTotal }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

**Files that reference `isSubscribed` and need updating:**

| File | Change |
|---|---|
| `src/components/auth/AIGateModal.tsx` | `isSubscribed` → `hasActiveLicense` |
| `src/components/auth/DownloadGateModal.tsx` | `isSubscribed` → `hasActiveLicense` |
| Any other `useAuth()` consumer | `isSubscribed` → `hasActiveLicense` |

---

### Phase 10: i18n Keys

Add these new keys to **all 6 locale files** (`messages/en.json`, `es.json`, `fr.json`, `pt-PT.json`, `pt-BR.json`, `it.json`):

```jsonc
// Inside "Account.pages.subscription":
{
  "activateLicense": "Activate License",
  "activateLicenseButton": "Activate",
  "activating": "Activating..."
}
```

Also update existing pricing i18n keys to reflect AI credits. In each `messages/*.json`:

```jsonc
// Update these existing keys:
{
  "creditsDesc": "10 AI credits per month (use on any AI feature)",       // was: "10 credits for our background changer..."
  "yearlyCredits": "20 AI credits per month (240/year) for any AI feature",  // was: "120 credits..."
  "bestForOccasional": "Best for: Occasional users",
  "bestForPower": "Best for: Power users & businesses"
}
```

---

## Firestore Data Structure

```
users/
  {userId}/
    licenses/
      active  ← summary document (for fast access checks)
        licenseKey: string
        status: "active"
        expiresAt: "2026-04-11T00:00:00Z"
        activationsRemaining: 0
        isActive: true
        planType: "monthly" | "yearly"
        aiCreditsTotal: 10          // or 20 for yearly
        aiCreditsRemaining: 7       // decrements with each AI use
        aiCreditsResetAt: "2026-05-11T00:00:00Z"
        updatedAt: serverTimestamp()

      {chariowLicenseId}  ← full license record
        licenseKey: string
        chariowLicenseId: string
        status: "active"
        expiresAt: "2026-04-11T00:00:00Z"
        activatedAt: "2025-04-11T00:00:00Z"
        activationCount: 1
        maxActivations: 1
        activationsRemaining: 0
        productName: "Monthly License"
        planType: "monthly"
        aiCreditsTotal: 10
        aiCreditsRemaining: 10
        aiCreditsResetAt: "2026-05-11T00:00:00Z"
        savedAt: serverTimestamp()
```

---

## Migration: Clean Up Old Subscription Code

| File | Action |
|---|---|
| `src/lib/firestore/subscriptions.ts` | **Delete** — replaced by `licenses.ts` |
| `AuthProvider.tsx` import | Remove `getUserSubscriptionStatus` import |
| All `isSubscribed` references | Replace with `hasActiveLicense` |
| Old `users/{uid}/subscription/` Firestore docs | Optional: delete or archive |

---

## Next Steps Checklist

- [ ] **1.** Add `CHARIOW_API_KEY` and all checkout URLs to `.env.local`
- [ ] **2.** Create `src/lib/chariow.ts` (API client)
- [ ] **3.** Create `src/lib/firestore/licenses.ts` (Firestore helpers with AI credits)
- [ ] **4.** Create API routes: `/api/licenses/activate` and `/api/licenses/validate`
- [ ] **5.** Create `src/components/billing/LicenseActivation.tsx` (dark theme component with `AICreditsBar`)
- [ ] **6.** Modify `src/app/[locale]/account/subscription/page.tsx` — wire in `LicenseActivation` + `AICreditsBar`, keep design
- [ ] **7.** Modify pricing section buttons in `src/app/[locale]/page.tsx` — wire to Chariow checkout
- [ ] **8.** Update pricing i18n keys in `messages/*.json` to reflect AI credits (10/mo, 20/mo for yearly)
- [ ] **9.** Update `AuthProvider.tsx` — replace `isSubscribed` with `hasActiveLicense`, add `aiCreditsRemaining`/`aiCreditsTotal`
- [ ] **10.** Update gate modals (`AIGateModal`, `DownloadGateModal`) — use `hasActiveLicense`
- [ ] **11.** Wire `consumeAICredit()` into AI feature usage flow (background remover, etc.)
- [ ] **12.** Add i18n keys to all 6 locale files
- [ ] **13.** Delete `src/lib/firestore/subscriptions.ts`
- [ ] **14.** Test end-to-end: buy license → activate → use AI features → credits decrement → buy top-up

---

## Key Differences from Original Proposal

| Aspect | Original | Revised |
|---|---|---|
| **New pages** | `/pricing`, `/activate` routes | **None** — reuse existing `/account/subscription` |
| **Design** | New light-theme components | **Dark theme** matching `zinc-900` / `#d4ff33` design |
| **Pricing section** | Separate `PricingSection` component | **Inline buttons wired** in existing landing page section |
| **Webhooks** | Included | **Removed** — not needed |
| **AI Credits** | Not included | **Full system**: track, display, decrement, top-up |
| **Credits UI** | None | **Progress bar** on subscription page + "Buy More" button |
| **Breaking changes** | New routes, new nav items | **Zero** — same routes, same sidebar, same pages |

---

## References

- [Chariow API — Activate License](https://chariow.dev/api-reference/licenses/activate-license)
- [Firebase Auth Guide](./FIREBASE_AUTH_GUIDE.md)
