'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, getAdditionalUserInfo } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { getUserLicenseStatus, resetCreditsIfNeeded } from '../lib/firestore/licenses';
import type { PerToolCredits } from '../lib/firestore/licenses';
import { handleRedirectResult } from '../lib/auth-utils';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasActiveLicense: boolean;
  aiCreditsRemaining?: number;
  aiCreditsTotal?: number;
  perToolCredits?: PerToolCredits;
  licenseInfo?: {
    licenseKey: string;
    expiresAt: string;
    status: string;
    planType: 'monthly' | 'yearly';
    productName?: string;
  } | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  hasActiveLicense: false,
  aiCreditsRemaining: undefined,
  aiCreditsTotal: undefined,
  perToolCredits: undefined,
  licenseInfo: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveLicense, setHasActiveLicense] = useState(false);
  const [aiCreditsRemaining, setAICreditsRemaining] = useState<number | undefined>();
  const [aiCreditsTotal, setAICreditsTotal] = useState<number | undefined>();
  const [perToolCredits, setPerToolCredits] = useState<PerToolCredits | undefined>();
  const [licenseInfo, setLicenseInfo] = useState<{
    licenseKey: string;
    expiresAt: string;
    status: string;
    planType: 'monthly' | 'yearly';
    productName?: string;
  } | null>(null);

  // Firestore real-time listener unsubscribe function
  const licenseUnsubscribe = useRef<(() => void) | null>(null);

  // Set up real-time listener for license document changes (credits, etc.)
  useEffect(() => {
    if (!user) {
      // Clean up listener when user signs out
      licenseUnsubscribe.current?.();
      licenseUnsubscribe.current = null;
      return;
    }

    const docRef = doc(db, 'users', user.uid, 'licenses', 'active');
    licenseUnsubscribe.current?.();

    licenseUnsubscribe.current = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setAICreditsRemaining(data.aiCreditsRemaining);
        setAICreditsTotal(data.aiCreditsTotal);
        setPerToolCredits(data.perToolCredits);
        setHasActiveLicense(data.isActive && (!data.expiresAt || new Date(data.expiresAt) > new Date()));
        if (data.isActive && data.licenseKey) {
          setLicenseInfo({
            licenseKey: data.licenseKey,
            expiresAt: data.expiresAt || '',
            status: 'active',
            planType: data.planType || 'monthly',
          });
        }
      } else {
        setAICreditsRemaining(undefined);
        setAICreditsTotal(undefined);
        setPerToolCredits(undefined);
        setHasActiveLicense(false);
        setLicenseInfo(null);
      }
    }, (error) => {
      console.error('[AuthProvider] License listener error:', error);
    });

    return () => {
      licenseUnsubscribe.current?.();
      licenseUnsubscribe.current = null;
    };
  }, [user]);

  useEffect(() => {
    // Handle redirect result first (in case user is returning from signInWithRedirect)
    handleRedirectResult(auth).then((result) => {
      if (result) {
        // Successfully signed in via redirect
        const additionalInfo = getAdditionalUserInfo(result);
        if (additionalInfo?.isNewUser) {
          fetch('/api/emails/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: result.user.email,
              firstName: result.user.displayName?.split(' ')[0] || '',
            }),
          }).catch(e => console.error('Failed to send welcome email:', e));
        }
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Mark that this browser has ever been authenticated (used for gate logic)
        if (typeof window !== 'undefined') {
          localStorage.setItem('refinedocs_has_logged_in', 'true');
        }
        // Check if credits need to be reset (monthly reset)
        await resetCreditsIfNeeded(firebaseUser.uid);

        // Fetch license status (after potential reset)
        const licenseStatus = await getUserLicenseStatus(firebaseUser.uid);
        setHasActiveLicense(licenseStatus.isActive);
        setAICreditsRemaining(licenseStatus.aiCreditsRemaining);
        setAICreditsTotal(licenseStatus.aiCreditsTotal);
        setPerToolCredits(licenseStatus.perToolCredits);
        if (licenseStatus.isActive && licenseStatus.licenseKey) {
          setLicenseInfo({
            licenseKey: licenseStatus.licenseKey,
            expiresAt: licenseStatus.expiresAt || '',
            status: 'active',
            planType: licenseStatus.planType || 'monthly',
          });
        } else {
          setLicenseInfo(null);
        }
      } else {
        setHasActiveLicense(false);
        setAICreditsRemaining(undefined);
        setAICreditsTotal(undefined);
        setPerToolCredits(undefined);
        setLicenseInfo(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, hasActiveLicense, aiCreditsRemaining, aiCreditsTotal, perToolCredits, licenseInfo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
