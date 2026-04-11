'use client';

import { useCallback, useState } from 'react';
import { useToolStateContext } from '../providers/ToolStateProvider';

/**
 * Drop-in replacement for `useState` that automatically persists to
 * sessionStorage via ToolStateProvider so state survives locale-change
 * page reloads.
 *
 * @param toolId  Unique tool key e.g. 'compress-pdf', 'csv-to-excel'
 * @param defaultState  Initial value used only when no saved state exists
 *
 * @example
 *   const [pdf, setPdf] = useToolState<PdfFile | null>('compress-pdf', null);
 */
export function useToolState<T>(toolId: string, defaultState: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const { getToolState, setToolState, clearToolState } = useToolStateContext();

  // On first access, prefer sessionStorage over the defaultState.
  const [state, setLocalState] = useState<T>(() => {
    const saved = getToolState<T>(toolId);
    return saved !== undefined ? saved : defaultState;
  });

  const setState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setLocalState((prev) => {
        const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
        setToolState(toolId, next);
        return next;
      });
    },
    [toolId, setToolState]
  );

  const reset = useCallback(() => {
    clearToolState(toolId);
    setLocalState(defaultState);
  }, [toolId, clearToolState, defaultState]);

  return [state, setState, reset];
}
