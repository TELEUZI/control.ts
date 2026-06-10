/**
 * Example: Client-Side Hydration with Control.ts
 *
 * This example demonstrates how to hydrate a server-rendered page on the client.
 */

import { Control } from '../control';
import { hydrate, isHydrationAvailable, mountWithHydration } from '../hydrate';

// Example component (same as server)
class AppComponent extends Control<HTMLDivElement> {
  protected _node: HTMLDivElement;
  protected children: Control[] = [];

  constructor() {
    super();
    this._node = document.createElement('div');
    this._node.className = 'app-container';
    this.render();
  }

  private render(): void {
    const title = document.createElement('h1');
    title.textContent = 'Welcome to Control.ts with SSR!';
    this._node.appendChild(title);

    const description = document.createElement('p');
    description.textContent = 'This page was server-rendered and can be hydrated on the client.';
    this._node.appendChild(description);

    const btn = document.createElement('button');
    btn.textContent = 'Click me!';

    // Event handlers are attached during hydration
    btn.onclick = () => alert('Button clicked after hydration!');
    this._node.appendChild(btn);
  }
}

/**
 * Method 1: Automatic hydration detection
 * This will automatically detect if hydration data exists and hydrate accordingly
 */
export function hydrateAppAutomatic(): void {
  const rootElement = document.getElementById('app') as HTMLElement;

  if (!rootElement) {
    console.error('Root element not found');
    return;
  }

  // mountWithHydration automatically detects if hydration is needed
  mountWithHydration(rootElement, () => new AppComponent());
}

/**
 * Method 2: Manual hydration check
 * Check if hydration data is available and handle accordingly
 */
export function hydrateAppManual(): void {
  const rootElement = document.getElementById('app') as HTMLElement;

  if (!rootElement) {
    console.error('Root element not found');
    return;
  }

  if (isHydrationAvailable()) {
    console.log('Hydration data found - hydrating...');
    const app = new AppComponent();
    hydrate(rootElement, app);
  } else {
    console.log('No hydration data - performing client-side render');
    const app = new AppComponent();
    rootElement.textContent = '';
    rootElement.append(app.node);
  }
}

/**
 * Method 3: Progressive enhancement
 * Works even if JavaScript fails to load
 */
export function progressiveEnhancement(): void {
  const rootElement = document.getElementById('app') as HTMLElement;

  if (!rootElement) {
    console.error('Root element not found');
    return;
  }

  try {
    // Try to hydrate
    mountWithHydration(rootElement, () => new AppComponent());
    console.log('App hydrated successfully');
  } catch (error) {
    console.error('Hydration failed:', error);
    // Fallback to client-side rendering
    const app = new AppComponent();
    rootElement.textContent = '';
    rootElement.append(app.node);
  }
}

/**
 * Entry point for client bundle
 */
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrateAppAutomatic);
  } else {
    hydrateAppAutomatic();
  }
}

/**
 * Example with routing (for SPA with SSR)
 */
export function hydrateWithRouting(): void {
  const rootElement = document.getElementById('app') as HTMLElement;

  if (!rootElement) {
    console.error('Root element not found');
    return;
  }

  // Get initial route from server
  const currentPath = window.location.pathname;

  // Create app based on route
  const app = createAppForRoute(currentPath);

  // Hydrate
  mountWithHydration(rootElement, () => app);

  // Set up client-side routing
  window.addEventListener('popstate', () => {
    const newPath = window.location.pathname;
    const newApp = createAppForRoute(newPath);
    rootElement.textContent = '';
    rootElement.append(newApp.node);
  });
}

function createAppForRoute(path: string): Control {
  // This is a simplified example
  switch (path) {
    case '/':
      return new AppComponent();
    case '/about':
      return new AppComponent(); // Would be AboutComponent in real app
    default:
      return new AppComponent();
  }
}
