import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  Auth,
  UserCredential
} from 'firebase/auth';

/**
 * Robust detection of mobile devices to determine best auth method
 */
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Check if we're on a route with COOP/COEP headers that would block popups
 */
const isOnRestrictedRoute = () => {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.includes('/tools');
};

/**
 * Centralized Google Sign-In helper that handles popups, redirects,
 * and common errors like 'popup-closed-by-user' gracefully.
 */
export const signInWithGoogle = async (
  auth: Auth,
  provider: GoogleAuthProvider
): Promise<UserCredential | null | void> => {
  // Always use redirect on mobile or on /tools routes (COOP/COEP blocks popups)
  if (isMobile() || isOnRestrictedRoute()) {
    return signInWithRedirect(auth, provider);
  }

  try {
    return await signInWithPopup(auth, provider);
  } catch (error: any) {
    // If popup was blocked by the browser, fallback to redirect
    if (error.code === 'auth/popup-blocked') {
      return signInWithRedirect(auth, provider);
    }

    // Gracefully handle abandonment errors — no need to log these as "failures"
    // as they are typically user-initiated or triggered by browser behavior.
    if (
      error.code === 'auth/popup-closed-by-user' ||
      error.code === 'auth/cancelled-popup-request'
    ) {
      console.log('Sign-in interaction cancelled by user or browser.');
      return null;
    }

    // Re-throw other errors to be handled by the UI
    throw error;
  }
};

/**
 * Handle redirect result after sign-in (call this on app initialization)
 */
export const handleRedirectResult = async (auth: Auth): Promise<UserCredential | null> => {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error: any) {
    console.error('Redirect sign-in error:', error);
    return null;
  }
};
