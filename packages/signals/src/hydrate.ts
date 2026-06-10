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
  hydrate,
  isHydrationAvailable,
  loadHydrationData,
  mountWithHydration,
} from '@control.ts/control';
import type { Signal } from '@preact/signals-core';

// Re-export base hydration utilities
export { clearHydrationData, hydrate, isHydrationAvailable, loadHydrationData, mountWithHydration };
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
      signal.value = hydratedVal;
    }
  }
}

/**
 * Load serialized signal state
 * Restores signal values from server-rendered state
 */
export function loadSignalState<T = Record<string, unknown>>(): T | null {
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
