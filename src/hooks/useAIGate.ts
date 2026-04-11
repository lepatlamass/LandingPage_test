'use client';

import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../providers/AuthProvider';

export type AIGateModalState = 'none' | 'login' | 'subscribe';

export interface UseAIGateReturn {
  /** Wrap any AI process function with this to apply the gate. */
  guardedAction: (actionFn: () => void | Promise<void>) => void;
  /** Current modal state — pass directly to <AIGateModal> */
  modalState: AIGateModalState;
  /** Call to close the modal (e.g. user dismissed it) */
  closeModal: () => void;
  /** Called internally after successful sign-in to auto-trigger the pending action */
  onLoginSuccess: () => void;
}

/**
 * AI Gate logic:
 *   - Subscribed user     → action runs immediately
 *   - Not logged in       → show login modal (AI requires auth)
 *   - Logged in, not sub  → show subscribe modal (AI requires subscription)
 */
export function useAIGate(): UseAIGateReturn {
  const { user, isSubscribed } = useAuth();
  const [modalState, setModalState] = useState<AIGateModalState>('none');
  // Store the pending action function so we can auto-run it after login or just hold it
  const pendingAction = useRef<(() => void | Promise<void>) | null>(null);

  const guardedAction = useCallback(
    (actionFn: () => void | Promise<void>) => {
      // If user is explicitly subscribed, allow access immediately.
      if (isSubscribed) {
        actionFn();
        return;
      }

      // Save the action to potentially auto-trigger after login.
      pendingAction.current = actionFn;

      if (!user) {
        // Not logged in — show login gate.
        setModalState('login');
      } else {
        // Logged in but not subscribed — show subscribe gate.
        setModalState('subscribe');
      }
    },
    [user, isSubscribed]
  );

  const closeModal = useCallback(() => {
    setModalState('none');
    pendingAction.current = null;
  }, []);

  /**
   * Called by AIGateModal after successful Google sign-in.
   * Auto-fires the pending action if they're subscribed, otherwise wait.
   * Note: The auth object will update, so we'll just wait for state flush.
   */
  const onLoginSuccess = useCallback(() => {
    // If they just logged in, they might not be subscribed yet,
    // so we close the login modal. If they attempt it again, it'll show subscribe.
    // However, if we want to seamlessly check, it's safer to just set 'none'
    // and let them click 'Process' again.
    setModalState('none');
    // We intentionally don't auto-run for AI after login, 
    // because chances are they still need to subscribe.
    pendingAction.current = null;
  }, []);

  return { guardedAction, modalState, closeModal, onLoginSuccess };
}
