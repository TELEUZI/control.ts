/**
 * Client-side Hydration for @control.ts/signals
 *
 * This module provides hydration support for signals package with reactive components.
 */

import type { HydrationData } from '@control.ts/control';
import {
  clearHydrationData,
  getHydratedSignals,
  getSSRContext,
  isHydrationAvailable,
  loadHydrationData,
  mountWithHydration,
} from '@control.ts/control';
import type { Signal } from '@preact/signals-core';

// Re-export base hydration utilities
export { clearHydrationData, isHydrationAvailable, loadHydrationData, mountWithHydration };
export type { HydrationData };

let hydratedSignalsCache: unknown[] | null = null;
let signalCursor = 0;

export function consumeNextSignal(): unknown | undefined {
  if (hydratedSignalsCache === null) {
    hydratedSignalsCache = getHydratedSignals();
  }
  if (hydratedSignalsCache && signalCursor < hydratedSignalsCache.length) {
    return hydratedSignalsCache[signalCursor++];
  }
  return undefined;
}

export function hydrateOrSerializeSignal(signal: Signal<unknown>): void {
  if (typeof document === 'undefined') {
    const ssrCtx = getSSRContext();
    if (ssrCtx) ssrCtx.signals.push(signal.value);
  } else {
    const hydratedVal = consumeNextSignal();
    if (hydratedVal !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      signal.value = hydratedVal as any;
    }
  }
}

/**
 * Load serialized signal state
 * Restores signal values from server-rendered state
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadSignalState<T = Record<string, any>>(): T | null {
  if (typeof document === 'undefined') return null;

  const script = document.getElementById('__SIGNAL_STATE__');
  if (!script) return null;

  try {
    return JSON.parse(script.textContent || '{}') as T;
  } catch (error) {
    console.error('Failed to parse signal state:', error);
    return null;
  }
}
