# 🔐 Firebase Google Auth — Integration Guide

This guide is written specifically for **this project's architecture**:
- **Next.js 14 App Router** with `output: 'standalone'`
- **`next-intl`** for i18n with `[locale]` dynamic segment
- **Existing `middleware.ts`** that handles locale routing
- **Server Components** by default (`layout.tsx`, `page.tsx` are RSCs)

> **Zero breaking changes guaranteed.** All routes remain public. You can enable protection later.

---

## ⚡ Quick Reference: Your Project's Key Files

| File | Role | Notes |
|---|---|---|
| `src/app/layout.tsx` | Root layout (RSC) | Wraps entire app |
| `src/app/[locale]/layout.tsx` | Locale layout (RSC) | Contains `NextIntlClientProvider` |
| `src/middleware.ts` | Handles i18n routing | Do **NOT** modify for auth |
| `src/lib/` | Shared utilities | Firebase init goes here |
| `src/navigation.ts` | Locale-aware Link/Router | Use this, NOT `next/navigation` |

---

## Step 1 — Install Firebase SDK

```bash
npm install firebase
```

**Verification:** Check `package.json` — `firebase` should appear under `dependencies`.

---

## Step 2 — Firebase Console Setup

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (or use an existing one)
3. Click **"Add app"** → choose **Web** (`</>`)
4. Register a name (e.g., `refinedocs-web`) — copy the config object shown
5. In the left sidebar → **Authentication** → **Get started**
6. Under **Sign-in method** → enable **Google**
7. Add your authorized domain: `localhost` (already there) + your production domain

---

## Step 3 — Environment Variables

**File: `.env.local`** (create at project root if it doesn't exist)

```bash
# Firebase Web Config — All must be NEXT_PUBLIC_ to be readable in the browser
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

> **Why `NEXT_PUBLIC_`?**
> Next.js runs both on the server AND in the browser. Without `NEXT_PUBLIC_`, env variables are
> server-only and will be `undefined` in client components — causing Firebase to silently fail.
> Firebase Auth runs entirely in the browser, so these **must** be prefixed.

> ⚠️ **`.env.local` is already in `.gitignore`** — never commit it.

---

## Step 4 — Firebase Initializer

**File: `src/lib/firebase.ts`** ← Create this new file

```typescript
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Prevent duplicate initializations during Next.js hot-reloads
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
```

> **Why `getApps().length ? getApp() : initializeApp()`?**
> Next.js hot-reload can call module-level code multiple times. Without this guard,
> Firebase throws `"Firebase: Firebase App named '[DEFAULT]' already exists"`.

**Verification:** Run `npm run dev` — no console errors on startup.

---

## Step 5 — Auth Context Provider

**File: `src/providers/AuthProvider.tsx`** ← Create this new file

```typescript
// src/providers/AuthProvider.tsx
'use client'; // ← REQUIRED: Firebase Auth only works in the browser

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state — Firebase handles persistence automatically
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Convenience hook — use this anywhere in client components
export function useAuth() {
  return useContext(AuthContext);
}
```

---

## Step 6 — Wrap Your Layout (Non-Breaking)

**File: `src/app/[locale]/layout.tsx`** ← Modify ONLY this file

Your current layout:
```tsx
// CURRENT — do not break this
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import React from 'react';

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">{children}</main>
      </div>
    </NextIntlClientProvider>
  );
}
```

**Updated layout — add only the 2 highlighted lines:**
```tsx
// UPDATED src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import React from 'react';
import { AuthProvider } from '../../providers/AuthProvider'; // ← ADD THIS

export default async function LocaleLayout({ children, params }: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <AuthProvider> {/* ← ADD THIS WRAPPER */}
        <div className="min-h-screen flex flex-col">
          <main className="flex-grow">{children}</main>
        </div>
      </AuthProvider> {/* ← AND CLOSE HERE */}
    </NextIntlClientProvider>
  );
}
```

> **Why is this non-breaking?**
> `AuthProvider` is a Client Component but it can wrap Server Components. 
> Next.js passes RSC-rendered children through Client boundaries safely.
> `NextIntlClientProvider` already follows this exact same pattern.

**Verification:** Run `npm run dev` → visit `http://localhost:3000` → all pages load normally.

---

## Step 7 — Google Sign-In Button Component

**File: `src/components/auth/GoogleSignInButton.tsx`** ← Create this new file

```typescript
// src/components/auth/GoogleSignInButton.tsx
'use client';

import { signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { useAuth } from '../../providers/AuthProvider';

export default function GoogleSignInButton() {
  const { user, loading } = useAuth();

  async function handleSignIn() {
    try {
      // Try popup first (best UX on desktop)
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      // Popup blocked (common on mobile/Safari) — fallback to redirect
      if (firebaseError.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, googleProvider);
      } else {
        console.error('Sign-in failed:', error);
      }
    }
  }

  async function handleSignOut() {
    await signOut(auth);
  }

  if (loading) {
    return (
      <button
        disabled
        className="px-4 py-1.5 bg-gray-700 text-gray-400 text-xs font-bold rounded cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        {user.photoURL && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-7 h-7 rounded-full"
          />
        )}
        <button
          onClick={handleSignOut}
          className="px-4 py-1.5 bg-white/10 text-white text-xs font-bold rounded hover:bg-white/20 transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="px-4 py-1.5 bg-[#d4ff33] text-black text-xs font-bold rounded hover:bg-[#bce622] transition-colors"
    >
      Sign in with Google
    </button>
  );
}
```

---

## Step 8 — Drop the Button Into Your Nav (Optional)

The nav is in **`src/app/[locale]/page.tsx`** around **line 102–113**.

Find the current "Get Pro" button block:
```tsx
// FIND THIS (around line 104)
<Link href="/tools" className="text-xs font-medium text-gray-300 hover:text-white transition-colors hidden sm:block">
  {tCommon('logIn')}
</Link>
<Link href="/tools" className="px-4 py-1.5 bg-[#d4ff33] ...">
  Get Pro
</Link>
```

Replace with:
```tsx
// REPLACE WITH THIS
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';

// ...then in JSX:
<GoogleSignInButton />
<Link href="/tools" className="px-4 py-1.5 bg-[#d4ff33] ...">
  Get Pro
</Link>
```

> ⚠️ **Important:** `page.tsx` is a **Server Component** (`async function Page()`).
> You **cannot** use `useAuth()` directly in it.
> `GoogleSignInButton` is already marked `'use client'` — import it and it will work perfectly.

---

## Step 9 — Route Protection (OPTIONAL — Enable Later)

All routes are currently **public**. When you're ready to protect specific pages, use this pattern:

**File: `src/components/auth/ProtectedRoute.tsx`** ← Create only when needed

```typescript
// src/components/auth/ProtectedRoute.tsx
'use client';

import { useAuth } from '../../providers/AuthProvider';
import { useRouter } from '../../navigation'; // ← Your locale-aware router

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    router.push('/'); // Redirect to home (locale-aware)
    return null;
    }

  return <>{children}</>;
}
```

**To protect a page**, wrap its content in the page file:
```tsx
// Example: src/app/[locale]/dashboard/page.tsx
import ProtectedRoute from '../../../components/auth/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Protected dashboard content</div>
    </ProtectedRoute>
  );
}
```

---

## Step 10 — `next.config.mjs`: No Changes Required ✅

> Your current `next.config.mjs` does **not** need any modifications.
> 
> One important note: your `/tools` routes have `Cross-Origin-Opener-Policy: same-origin`.
> This **will block Firebase Auth popups** on tool pages if you ever add sign-in there.
> The COOP header is already scoped only to `/:locale/tools` and `/tools` — the home page
> is unaffected and popups work fine there. If you need auth on tool pages, use
> `signInWithRedirect` instead of `signInWithPopup` for those routes.

---

## ⚠️ Next.js-Specific Pitfalls & How to Avoid Them

### 1. Hydration Mismatch
**Problem:** Server renders `null` user, client renders signed-in state → mismatch.  
**Solution:** The `loading` state in `AuthProvider` ensures we render a neutral state until Firebase resolves. Always check `loading` before rendering auth-dependent UI.

### 2. RSC Boundaries
**Problem:** Trying to call `useAuth()` in a Server Component.  
**Solution:** Keep auth entirely client-side. Server Components cannot subscribe to Firebase. If you need user info server-side (e.g., for data fetching), pass it via cookies using a session token — an advanced pattern not needed initially.

### 3. `middleware.ts` Conflicts
**Problem:** Modifying `middleware.ts` for auth can conflict with `next-intl` locale handling.  
**Solution:** Leave `middleware.ts` untouched. Use the `<ProtectedRoute>` client component pattern (Step 9) instead. This is safe and locale-aware.

### 4. COOP Header on Tool Pages
**Problem:** `Cross-Origin-Opener-Policy: same-origin` blocks `signInWithPopup`.  
**Solution:** Use `signInWithRedirect` on tool pages. The `GoogleSignInButton` already handles this with a fallback.

### 5. Firebase App Duplicate Init
**Problem:** Hot-reload re-runs module-level code.  
**Solution:** Already handled with `getApps().length ? getApp() : initializeApp()` in `lib/firebase.ts`.

---

## ✅ Rollback & Testing Checklist

Run through this after each step:

- [ ] **Step 4** — `npm run dev` → No console errors
- [ ] **Step 6** — Visit `http://localhost:3000/en` → Page loads normally, no hydration warnings in browser console
- [ ] **Step 7** — Component file saved → No TypeScript errors
- [ ] **Step 8** — Sign-in button appears in nav → Click it → Google popup opens → Sign in works
- [ ] **After sign-in** — User avatar appears, Sign Out button visible
- [ ] **After sign-out** — Returns to sign-in button state
- [ ] **All existing routes** — `/en`, `/en/tools`, `/en/privacy`, `/en/terms`, `/en/contact` all still work
- [ ] **Locale switching** — All languages still work via the `LanguageSwitcher`

### To Rollback Completely:
1. Delete `src/lib/firebase.ts`
2. Delete `src/providers/AuthProvider.tsx`
3. Delete `src/components/auth/GoogleSignInButton.tsx`
4. Revert `src/app/[locale]/layout.tsx` (remove `AuthProvider` import and wrapper)
5. Remove `NEXT_PUBLIC_FIREBASE_*` from `.env.local`

The rest of your app is completely untouched.

---

## 📁 New Files Summary

```
src/
├── lib/
│   └── firebase.ts                        ← NEW: Firebase init
├── providers/
│   └── AuthProvider.tsx                   ← NEW: Auth context
└── components/
    └── auth/
        ├── GoogleSignInButton.tsx         ← NEW: Drop-in sign-in button
        └── ProtectedRoute.tsx             ← NEW (optional): Route guard
```

**Modified files: only `src/app/[locale]/layout.tsx`** (2 lines added)
