import type { Control } from './control';
import type { ElementFnProps, TagName } from './factories';
import { VirtualNode } from './virtual-node';

export type SSRContext = {
  /**
   * Whether we're in server-side rendering mode
   */
  isServer: boolean;
  /**
   * Component IDs for hydration tracking
   */
  componentId: number;
  /**
   * Serialized component data for hydration
   */
  hydrationData: Map<number, HydrationData>;
  /**
   * Serialized signal values
   */
  signals: unknown[];
};

export type HydrationData = {
  id: number;
  tag: string;
  props: Record<string, unknown>;
  events: string[];
  hasChildren: boolean;
};

/**
 * Global SSR context
 */
let ssrContext: SSRContext | null = null;

/**
 * Check if we're in a server environment
 */
export function isServerEnvironment(): boolean {
  return typeof window === 'undefined' || typeof document === 'undefined';
}

/**
 * Initialize SSR context
 */
export function createSSRContext(): SSRContext {
  ssrContext = {
    isServer: true,
    componentId: 0,
    hydrationData: new Map(),
    signals: [],
  };
  return ssrContext;
}

/**
 * Get current SSR context
 */
export function getSSRContext(): SSRContext | null {
  return ssrContext;
}

/**
 * Clear SSR context
 */
export function clearSSRContext(): void {
  ssrContext = null;
}

/**
 * Helper to check if we should use SSR mode
 */
export function shouldUseSSR(): boolean {
  return isServerEnvironment() || getSSRContext()?.isServer === true;
}

/**
 * Generate next component ID
 */
export function nextComponentId(): number {
  if (!ssrContext) {
    throw new Error('SSR context not initialized. Call createSSRContext() first.');
  }
  return ssrContext.componentId++;
}

/**
 * Register component for hydration
 */
export function registerForHydration(data: HydrationData): void {
  if (!ssrContext) return;
  ssrContext.hydrationData.set(data.id, data);
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] ?? '');
}

/**
 * Serialize attributes to HTML string
 */
function serializeAttributes(props: Record<string, unknown>): string {
  const attributes: string[] = [];

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;

    // Skip special props
    if (key === 'txt' || key === 'textContent' || key === 'style' || key === 'children') {
      continue;
    }

    // Handle boolean attributes
    if (typeof value === 'boolean') {
      if (value) {
        attributes.push(key);
      }
      continue;
    }

    // Handle className
    if (key === 'className') {
      attributes.push(`class="${escapeHtml(String(value))}"`);
      continue;
    }

    // Handle regular attributes
    attributes.push(`${key}="${escapeHtml(String(value))}"`);
  }

  return attributes.join(' ');
}

// Removed unused serializeStyle and VOID_ELEMENTS

/**
 * Render element to HTML string
 */
export function renderToString<T extends TagName>(
  tag: T,
  props: ElementFnProps<HTMLElementTagNameMap[T]>,
  children: Array<HTMLElement | string> = [],
): string {
  const node = new VirtualNode(tag);

  // Add data-hydrate attribute if in SSR mode
  if (ssrContext) {
    const componentId = nextComponentId();
    node.setAttribute('data-hydrate', String(componentId));

    // Register for hydration
    registerForHydration({
      id: componentId,
      tag,
      props: { ...props },
      events: [],
      hasChildren: children.length > 0,
    });
  }

  for (const [key, value] of Object.entries(props)) {
    if (key === 'txt' || key === 'textContent') {
      node.textContent = String(value);
    } else if (key === 'style' && typeof value === 'object') {
      for (const [sKey, sVal] of Object.entries(value as Record<string, string>)) {
        node.style.setProperty(sKey.replace(/([A-Z])/g, '-$1').toLowerCase(), sVal);
      }
    } else if (key === 'className') {
      node.className = String(value);
    } else if (typeof value === 'boolean') {
      if (value) node.setAttribute(key, '');
    } else if (value !== undefined && value !== null && key !== 'children') {
      node.setAttribute(key, String(value));
    }
  }

  for (const child of children) {
    if (typeof child === 'object' && 'outerHTML' in child) {
      // If it's a real DOM node or another object with outerHTML
      node.appendChild(child.outerHTML);
    } else {
      node.appendChild(child);
    }
  }

  return node.outerHTML;
}

/**
 * Render Control component to HTML string
 */
export function renderControlToString(component: Control): string {
  // Control already has toString() method that returns outerHTML
  return component.toString();
}

export interface IRenderableComponent {
  node: { outerHTML?: string } | HTMLElement | null;
}

/**
 * Render BaseComponent to HTML string
 */
export function renderComponentToString(component: IRenderableComponent): string {
  if (component.node && 'outerHTML' in component.node && component.node.outerHTML) {
    return component.node.outerHTML;
  }
  return '';
}

/**
 * Serialize hydration data to JSON script tag
 */
export function serializeHydrationData(): string {
  if (!ssrContext || ssrContext.hydrationData.size === 0) {
    return '';
  }

  const data = {
    components: Array.from(ssrContext.hydrationData.entries()).reduce(
      (acc, [id, hydrationData]) => {
        acc[id] = hydrationData;
        return acc;
      },
      {} as Record<number, HydrationData>,
    ),
    signals: ssrContext.signals,
  };

  const json = JSON.stringify(data);
  return `<script id="__CONTROL_HYDRATION_DATA__" type="application/json">${json}</script>`;
}

/**
 * Render app to complete HTML document
 */
export function renderToDocument(
  app: Control | string,
  options: {
    title?: string;
    meta?: Array<{ name?: string; property?: string; content?: string; charset?: string }>;
    links?: Array<{ rel: string; href: string; [key: string]: string }>;
    scripts?: Array<{ src?: string; content?: string; type?: string; [key: string]: unknown }>;
    lang?: string;
    head?: string;
    bodyAttrs?: Record<string, string>;
  } = {},
): string {
  const appHtml = typeof app === 'string' ? app : renderControlToString(app);
  const hydrationScript = serializeHydrationData();

  const metaTags = (options.meta || [])
    .map((meta) => {
      const attrs = Object.entries(meta)
        .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
        .join(' ');
      return `<meta ${attrs}>`;
    })
    .join('\n    ');

  const linkTags = (options.links || [])
    .map((link) => {
      const attrs = Object.entries(link)
        .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
        .join(' ');
      return `<link ${attrs}>`;
    })
    .join('\n    ');

  const scriptTags = (options.scripts || [])
    .map((script) => {
      if (script.content) {
        const type = script.type || 'text/javascript';
        return `<script type="${type}">${script.content}</script>`;
      }
      const attrs = Object.entries(script)
        .filter(([key]) => key !== 'content')
        .map(([key, value]) => `${key}="${escapeHtml(String(value))}"`)
        .join(' ');
      return `<script ${attrs}></script>`;
    })
    .join('\n    ');

  const bodyAttrs = options.bodyAttrs ? ' ' + serializeAttributes(options.bodyAttrs) : '';

  const html = `<!DOCTYPE html>
<html lang="${options.lang || 'en'}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(options.title || 'Control.ts App')}</title>
    ${metaTags}
    ${linkTags}
    ${options.head || ''}
  </head>
  <body${bodyAttrs}>
    <div id="app">${appHtml}</div>
    ${hydrationScript}
    ${scriptTags}
  </body>
</html>`;

  clearSSRContext();

  return html;
}

/**
 * Render complete HTML document with BaseComponent
 */
export function renderComponentToDocument(
  app: IRenderableComponent | string,
  options?: Parameters<typeof renderToDocument>[1],
): string {
  const appHtml = typeof app === 'string' ? app : renderComponentToString(app);
  return renderToDocument(appHtml, options);
}

/**
 * Stream rendering (for future implementation)
 */
export interface SSRStream {
  push(chunk: string): void;
  end(): void;
}

/**
 * Render app to stream (placeholder for future implementation)
 */
export function renderToStream(app: Control, stream: SSRStream): void {
  // For now, just render to string and push
  const html = renderControlToString(app);
  stream.push(html);
  stream.end();
}
