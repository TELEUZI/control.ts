import type { Route } from './index.js';
import { matchRoute } from './index.js';

export type RouterOptions = {
  routes: Route[];
  base?: string;
  mount: (component: unknown) => void;
};

export function createRouter(options: RouterOptions) {
  const { routes, base = '/', mount } = options;

  const navigationListeners = new Set<(isNavigating: boolean) => void>();
  const routeChangeListeners = new Set<(component: unknown) => void>();
  const errorListeners = new Set<(error: Error) => void>();

  const notifyListeners = (isNavigating: boolean) => {
    for (const listener of navigationListeners) {
      listener(isNavigating);
    }
  };

  async function resolveRouteData(path: string) {
    let cleanPath = path;
    if (cleanPath.startsWith(base)) {
      cleanPath = '/' + cleanPath.slice(base.length);
    }
    cleanPath = cleanPath.replace('//', '/');

    const matchPath = cleanPath.split('?')[0] || '/';

    for (const route of routes) {
      const match = matchRoute(route.path, matchPath);
      if (match.matches) {
        return { route, params: match.params };
      }
    }
    return null;
  }

  async function navigateTo(path: string) {
    const resolved = await resolveRouteData(path);

    if (resolved) {
      let data = null;
      if (resolved.route.loader) {
        data = await resolved.route.loader({ url: new URL(path, window.location.origin), params: resolved.params });
      }

      const newComponent = await resolved.route.component(data);
      if (routeChangeListeners.size > 0) {
        for (const listener of routeChangeListeners) {
          listener(newComponent);
        }
      } else {
        mount(newComponent);
      }
    } else {
      console.error(`[Router] No route matched for path: ${path}`);
      for (const listener of errorListeners) {
        listener(new Error(`No route matched for path: ${path}`));
      }
    }
  }

  const router = {
    navigate: async (path: string) => {
      window.history.pushState({}, '', path);
      notifyListeners(true);
      try {
        await navigateTo(path);
      } finally {
        notifyListeners(false);
      }
    },
    prefetch: async (path: string) => {
      const resolved = await resolveRouteData(path);
      if (resolved && resolved.route.loader) {
        await resolved.route.loader({ url: new URL(path, window.location.origin), params: resolved.params });
      }
      if (resolved && typeof resolved.route.component === 'function') {
        const compPromise = resolved.route.component(null);
        if (compPromise instanceof Promise) {
          await compPromise.catch((e) => {
            console.error(`[Router] Failed to prefetch route ${path}:`, e);
          });
        }
      }
    },
    subscribe: (cb: (isNavigating: boolean) => void) => {
      navigationListeners.add(cb);
      return () => navigationListeners.delete(cb);
    },
    onNavigate: (cb: (component: unknown) => void) => {
      routeChangeListeners.add(cb);
      return () => routeChangeListeners.delete(cb);
    },
    onError: (cb: (error: Error) => void) => {
      errorListeners.add(cb);
      return () => errorListeners.delete(cb);
    },
    init: async (skipInitial = false) => {
      if (!skipInitial) {
        notifyListeners(true);
        try {
          await navigateTo(window.location.pathname + window.location.search);
        } catch (error) {
          for (const listener of errorListeners) {
            listener(error as Error);
          }
        } finally {
          notifyListeners(false);
        }
      }

      window.addEventListener('popstate', async () => {
        notifyListeners(true);
        try {
          await navigateTo(window.location.pathname + window.location.search);
        } catch (error) {
          for (const listener of errorListeners) {
            listener(error as Error);
          }
        } finally {
          notifyListeners(false);
        }
      });
    },
  };

  return router;
}
