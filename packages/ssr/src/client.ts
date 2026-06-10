import type { Route } from '@control.ts/router';
import { createRouter, matchRoute } from '@control.ts/router';

export type HydrateClientOptions = {
  routes: Route[];
  base?: string;
  mount: (component: unknown) => void;
};

export const clientRouter: {
  navigate: (path: string) => Promise<void>;
  prefetch: (path: string) => Promise<void>;
  subscribe: (callback: (isNavigating: boolean) => void) => () => void;
  onNavigate: (callback: (component: unknown) => void) => () => void;
} = {
  navigate: async () => {
    console.warn('Router not initialized');
  },
  prefetch: async () => {
    console.warn('Router not initialized');
  },
  subscribe: () => () => {},
  onNavigate: () => () => {},
};

export async function hydrateClient(options: HydrateClientOptions) {
  const { routes, base = '/', mount } = options;

  const router = createRouter({ routes, base, mount });

  clientRouter.navigate = router.navigate;
  clientRouter.prefetch = router.prefetch;
  clientRouter.subscribe = router.subscribe;
  clientRouter.onNavigate = router.onNavigate;

  let urlPath = window.location.pathname;
  if (urlPath.startsWith(base)) {
    urlPath = '/' + urlPath.slice(base.length);
  }
  urlPath = urlPath.replace('//', '/');

  let matchedRoute = null;
  for (const route of routes) {
    const match = matchRoute(route.path, urlPath);
    if (match.matches) {
      matchedRoute = route;
      break;
    }
  }

  // Get initial data from window object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialData = (window as any).__INITIAL_DATA__;

  if (matchedRoute) {
    const rootComponent = await matchedRoute.component(initialData);
    mount(rootComponent);

    // After initial hydration, remove hydration scripts so subsequent SPA navigations perform fresh mounts
    const hydrationScript = document.getElementById('__HYDRATION_DATA__');
    if (hydrationScript) hydrationScript.remove();
    const signalScript = document.getElementById('__SIGNAL_STATE__');
    if (signalScript) signalScript.remove();
  } else {
    // Basic 404 handling if no route matched
    console.error(`[Router] No route matched for path: ${urlPath}`);
    const appRoot = document.getElementById('app');
    if (appRoot) {
      appRoot.innerHTML = '<h1>404 Not Found</h1>';
    }
  }

  // Set up popstate for browser back/forward, skipping initial SPA navigation since we just hydrated
  await router.init(true);
}
