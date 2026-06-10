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
  renderToDocument as baseRenderToDocument,
  serializeHydrationData,
  type SSRContext,
} from '@control.ts/control';

import type { BaseComponent } from './base-component';
import { getValue$ } from './utils';

// Re-export base SSR utilities
export { clearSSRContext, createSSRContext, getSSRContext, isServerEnvironment, serializeHydrationData };
export type { SSRContext };

/**
 * Render BaseComponent (with signals) to HTML string
 */
export function renderComponentToString(component: BaseComponent): string {
  if (component.node) {
    return component.node.outerHTML;
  }
  return '';
}

/**
 * Render complete HTML document with signals BaseComponent
 */
export function renderToDocument(
  app: BaseComponent | string,
  options?: Parameters<typeof baseRenderToDocument>[1],
): string {
  const appHtml = typeof app === 'string' ? app : renderComponentToString(app);
  return baseRenderToDocument(appHtml, options);
}

/**
 * Helper to check if we should use SSR mode
 */
export function shouldUseSSR(): boolean {
  return isServerEnvironment() || getSSRContext()?.isServer === true;
}

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
