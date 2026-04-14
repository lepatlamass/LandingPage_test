'use client';

import React, { createContext, useCallback, useContext, useRef } from 'react';

const SESSION_KEY_PREFIX = 'refinedocs_tool_';

// ── Context shape ──────────────────────────────────────────────────────────
interface ToolStateContextType {
  getToolState: <T>(toolId: string) => T | undefined;
  setToolState: <T>(toolId: string, state: T) => void;
  clearToolState: (toolId: string) => void;
}

const ToolStateContext = createContext<ToolStateContextType | null>(null);

// ── Helper: safe sessionStorage r/w ───────────────────────────────────────
function readSession<T>(toolId: string): T | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY_PREFIX + toolId);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

function writeSession<T>(toolId: string, state: T): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_KEY_PREFIX + toolId, JSON.stringify(state));
  } catch {
    // Quota exceeded or private browsing – silently ignore.
  }
}

function deleteSession(toolId: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(SESSION_KEY_PREFIX + toolId);
  } catch {
    // ignore
  }
}

// ── Provider ──────────────────────────────────────────────────────────────
/**
 * Wraps the app so that every tool component can persist its state across
 * locale-change page reloads via sessionStorage.
 *
 * Usage in tools:
 *   const [state, setState] = useToolState('compress-pdf', defaultState);
 */
export function ToolStateProvider({ children }: { children: React.ReactNode }) {
  // In-memory cache so reads within the same page load are synchronous.
  const cache = useRef<Map<string, unknown>>(new Map());

  const getToolState = useCallback(<T,>(toolId: string): T | undefined => {
    if (cache.current.has(toolId)) {
      return cache.current.get(toolId) as T;
    }
    const fromSession = readSession<T>(toolId);
    if (fromSession !== undefined) {
      cache.current.set(toolId, fromSession);
    }
    return fromSession;
  }, []);

  const setToolState = useCallback(<T,>(toolId: string, state: T): void => {
    cache.current.set(toolId, state);
    writeSession(toolId, state);
  }, []);

  const clearToolState = useCallback((toolId: string): void => {
    cache.current.delete(toolId);
    deleteSession(toolId);
  }, []);

  return (
    <ToolStateContext.Provider value={{ getToolState, setToolState, clearToolState }}>
      {children}
    </ToolStateContext.Provider>
  );
}

// ── Internal hook (used by useToolState) ─────────────────────────────────
export function useToolStateContext() {
  const ctx = useContext(ToolStateContext);
  if (!ctx) {
    throw new Error('useToolState must be used inside <ToolStateProvider>');
  }
  return ctx;
}
