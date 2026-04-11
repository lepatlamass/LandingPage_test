'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUserSubscriptionStatus } from '../lib/firestore/subscriptions';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isSubscribed: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isSubscribed: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Mark that this browser has ever been authenticated (used for gate logic)
        if (typeof window !== 'undefined') {
          localStorage.setItem('refindocs_has_logged_in', 'true');
        }
        // Fetch subscription status
        const status = await getUserSubscriptionStatus(firebaseUser.uid);
        setIsSubscribed(status.isActive);
      } else {
        setIsSubscribed(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isSubscribed }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
