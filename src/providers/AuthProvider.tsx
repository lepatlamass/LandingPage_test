'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUserLicenseStatus } from '../lib/firestore/licenses';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasActiveLicense: boolean;
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
        // Mark that this browser has ever been authenticated (used for gate logic)
        if (typeof window !== 'undefined') {
          localStorage.setItem('refindocs_has_logged_in', 'true');
        }
        // Fetch license status
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
