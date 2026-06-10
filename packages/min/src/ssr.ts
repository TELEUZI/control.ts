/**
 * Server-Side Rendering for @control.ts/min
 *
 * This module provides SSR support for the min package's BaseComponent.
 */

import {
  clearSSRContext,
  createSSRContext,
  getSSRContext,
  isServerEnvironment,
  renderToDocument as baseRenderToDocument,
  renderToString,
  serializeHydrationData,
  type SSRContext,
} from '@control.ts/control';

import type { BaseComponent, BaseComponentChild, BaseComponentProps } from './base-component';

// Re-export base SSR utilities
export { clearSSRContext, createSSRContext, getSSRContext, isServerEnvironment, serializeHydrationData };
export type { SSRContext };

/**
 * Render BaseComponent to HTML string
 */
export function renderComponentToString(component: BaseComponent): string {
  // BaseComponent has a public node getter
  const node = component.node;
  if (node && node.outerHTML) {
    return node.outerHTML;
  }
  return '';
}

/**
 * Render BaseComponent props and children to HTML
 */
export function renderBaseComponentToString<T extends keyof HTMLElementTagNameMap>(
  tag: T,
  props: BaseComponentProps<HTMLElementTagNameMap[T]>,
  children: BaseComponentChild[] = [],
): string {
  // Convert children to HTML strings
  const childrenHtml: string[] = [];

  for (const child of children) {
    if (child === null) continue;

    if (typeof child === 'string') {
      childrenHtml.push(child);
    } else if (child instanceof HTMLElement) {
      childrenHtml.push(child.outerHTML);
    } else if ('_node' in child) {
      // It's a BaseComponent
      childrenHtml.push(renderComponentToString(child as BaseComponent));
    }
  }

  // Use the base renderToString
  return renderToString(
    tag,
    {
      ...props,
      txt: props.txt,
      textContent: props.textContent || props.txt,
    },
    childrenHtml,
  );
}

/**
 * Render complete HTML document with BaseComponent
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
