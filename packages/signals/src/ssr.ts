/**
 * Server-Side Rendering for @control.ts/signals
 *
 * This module provides SSR support for the signals package's reactive BaseComponent.
 */

import {
  clearSSRContext,
  createSSRContext,
  getSSRContext,
  isServerEnvironment,
  renderComponentToDocument as renderToDocument,
  renderComponentToString,
  serializeHydrationData,
  shouldUseSSR,
  type SSRContext,
} from '@control.ts/control';

import { getValue$ } from './utils';

// Re-export base SSR utilities
export {
  clearSSRContext,
  createSSRContext,
  getSSRContext,
  isServerEnvironment,
  renderComponentToString,
  renderToDocument,
  serializeHydrationData,
  shouldUseSSR,
};
export type { SSRContext };

/**
 * Serialize signal state for hydration
 * Extracts current values from signals to send to client
 */
export function serializeSignalState(state: Record<string, unknown>): string {
  const serialized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(state)) {
    serialized[key] = getValue$(value);
  }

  return JSON.stringify(serialized);
}
