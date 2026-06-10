import type { Control } from './control';
import type { HydrationData } from './ssr';

/**
 * Load hydration data from the server
 */
export function loadHydrationData(): Map<number, HydrationData> | null {
  if (typeof document === 'undefined') return null;

  const script = document.getElementById('__CONTROL_HYDRATION_DATA__');
  if (!script) return null;

  try {
    const data = JSON.parse(script.textContent || '{}');
    const components = data.components || data; // Fallback for old format
    const map = new Map<number, HydrationData>();

    for (const [id, hydrationData] of Object.entries(components)) {
      map.set(Number(id), hydrationData as HydrationData);
    }

    return map;
  } catch (error) {
    console.error('Failed to parse hydration data:', error);
    return null;
  }
}

/**
 * Get serialized signal array from hydration data
 */
export function getHydratedSignals(): unknown[] | null {
  if (typeof document === 'undefined') return null;

  const script = document.getElementById('__CONTROL_HYDRATION_DATA__');
  if (!script) return null;

  try {
    const data = JSON.parse(script.textContent || '{}');
    return data.signals || null;
  } catch {
    return null;
  }
}

function migrateEvents(clientEl: HTMLElement, serverEl: HTMLElement) {
  // Migrate inline events (e.g. onclick)
  for (const key of Object.keys(clientEl)) {
    if (key.startsWith('on') && typeof (clientEl as unknown as Record<string, unknown>)[key] === 'function') {
      (serverEl as unknown as Record<string, unknown>)[key] = (clientEl as unknown as Record<string, unknown>)[key];
    }
  }

  // Special case for inputs
  if (clientEl instanceof HTMLInputElement && serverEl instanceof HTMLInputElement) {
    if (clientEl.value !== serverEl.value) {
      serverEl.value = clientEl.value;
    }
  }

  // Migrate addEventListener listeners
  const clientElWithListeners = clientEl as HTMLElement & {
    __listeners?: Array<{
      type: string;
      listener: EventListenerOrEventListenerObject;
      options?: boolean | AddEventListenerOptions;
    }>;
  };
  const listeners = clientElWithListeners.__listeners;
  if (listeners) {
    for (const { type, listener, options } of listeners) {
      serverEl.addEventListener(type, listener, options);
    }
  }
}

function walkAndMigrate(clientEl: HTMLElement, serverEl: HTMLElement, map: Map<HTMLElement, HTMLElement>) {
  if (!clientEl || !serverEl) return;

  map.set(clientEl, serverEl);
  migrateEvents(clientEl, serverEl);

  // Remove data-hydrate attribute to clean up DOM
  if (serverEl.hasAttribute('data-hydrate')) {
    serverEl.removeAttribute('data-hydrate');
  }

  const clientChildren = Array.from(clientEl.children);
  const serverChildren = Array.from(serverEl.children);

  for (let i = 0; i < Math.min(clientChildren.length, serverChildren.length); i++) {
    walkAndMigrate(clientChildren[i] as HTMLElement, serverChildren[i] as HTMLElement, map);
  }
}

function updateComponentNodes(component: Control, map: Map<HTMLElement, HTMLElement>) {
  const serverNode = map.get(component.node);
  if (serverNode) {
    (component as unknown as { _node: HTMLElement })._node = serverNode;
  }

  const children = (component as unknown as { children?: Control[] }).children || [];
  for (const child of children) {
    updateComponentNodes(child, map);
  }
}

/**
 * Hydrate entire application
 */
export function hydrate(rootElement: HTMLElement, app: Control | (() => Control)): void {
  // Load hydration data
  const hydrationData = loadHydrationData();

  if (!hydrationData) {
    console.warn('No hydration data found. Performing client-side rendering instead.');
    // If no hydration data, just mount normally
    if (typeof app === 'function') {
      const appComponent = app();
      rootElement.textContent = '';
      rootElement.append(appComponent.node);
    } else {
      rootElement.textContent = '';
      rootElement.append(app.node);
    }
    return;
  }

  // Get or create app component
  let appComponent: Control;
  const originalAddEventListener = HTMLElement.prototype.addEventListener;

  if (typeof app === 'function') {
    // Intercept event listeners during client tree generation
    HTMLElement.prototype.addEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).__listeners = (this as any).__listeners || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).__listeners.push({ type, listener, options });
      return originalAddEventListener.call(this, type, listener, options);
    };
    try {
      appComponent = app();
    } finally {
      HTMLElement.prototype.addEventListener = originalAddEventListener;
    }
  } else {
    appComponent = app;
  }

  // Perform hydration: parallel walk
  // The rootElement contains the server-rendered HTML.
  // We assume the first child is the app root.
  const serverRoot = rootElement.firstElementChild as HTMLElement;
  const clientRoot = appComponent.node;

  if (serverRoot && clientRoot) {
    const nodeMap = new Map<HTMLElement, HTMLElement>();
    walkAndMigrate(clientRoot, serverRoot, nodeMap);
    updateComponentNodes(appComponent, nodeMap);
  } else {
    // Fallback if structure is malformed
    rootElement.textContent = '';
    rootElement.append(appComponent.node);
  }

  // Optionally verify that server HTML matches client HTML
  if (process.env.NODE_ENV === 'development') {
    if (serverRoot && clientRoot) {
      verifyHydration(serverRoot, clientRoot);
    }
  }
}

/**
 * Verify that server-rendered HTML matches client-rendered HTML (dev mode only)
 */
function verifyHydration(serverElement: HTMLElement, clientElement: HTMLElement): void {
  // Compare tag names
  if (serverElement.tagName !== clientElement.tagName) {
    console.warn(`Hydration mismatch: expected tag ${serverElement.tagName}, got ${clientElement.tagName}`);
  }

  // Compare text content (simplified check)
  const serverText = serverElement.textContent?.trim();
  const clientText = clientElement.textContent?.trim();

  if (serverText !== clientText) {
    console.warn(`Hydration text mismatch: server text "${serverText}" !== client text "${clientText}"`);
  }

  // Compare children count
  const serverChildren = Array.from(serverElement.children);
  const clientChildren = Array.from(clientElement.children);

  if (serverChildren.length !== clientChildren.length) {
    console.warn(
      `Hydration children count mismatch: server has ${serverChildren.length} children, client has ${clientChildren.length}`,
    );
  }
}

/**
 * Check if hydration is available
 */
export function isHydrationAvailable(): boolean {
  if (typeof document === 'undefined') return false;
  return document.getElementById('__CONTROL_HYDRATION_DATA__') !== null;
}

/**
 * Mount with hydration support
 * Automatically detects if hydration data is available
 */
export function mountWithHydration(rootElement: HTMLElement, app: Control | (() => Control)): void {
  if (isHydrationAvailable()) {
    hydrate(rootElement, app);
  } else {
    // Regular mount
    const appComponent = typeof app === 'function' ? app() : app;
    rootElement.textContent = '';
    rootElement.append(appComponent.node);
  }
}

/**
 * Clear hydration data
 */
export function clearHydrationData(): void {
  // Remove hydration script from DOM
  const script = document.getElementById('__CONTROL_HYDRATION_DATA__');
  if (script) {
    script.remove();
  }
}
