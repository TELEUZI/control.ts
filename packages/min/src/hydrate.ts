/**
 * Client-side Hydration for @control.ts/min
 *
 * This module provides hydration support for min package components.
 */

import type { HydrationData } from '@control.ts/control';
import {
  clearHydrationData,
  hydrate,
  isHydrationAvailable,
  loadHydrationData,
  mountWithHydration,
} from '@control.ts/control';

// Re-export base hydration utilities
export { clearHydrationData, hydrate, isHydrationAvailable, loadHydrationData, mountWithHydration };
export type { HydrationData };
