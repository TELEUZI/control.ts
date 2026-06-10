import type { Control } from '@control.ts/control';

export type RouteLoaderArgs = {
  url: URL;
  params: Record<string, string>;
};

export type Route<TData = unknown, TComponent extends Control = Control> = {
  path: string;
  component: (data: TData) => TComponent | Promise<TComponent>;
  loader?: (args: RouteLoaderArgs) => Promise<TData> | TData;
  revalidate?: number; // Cache duration in seconds (ISR)
};

export function defineRoute<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TLoader extends ((args: RouteLoaderArgs) => any) | undefined = undefined,
  TComponent extends Control = Control,
>(route: {
  path: string;
  loader?: TLoader;
  component: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: TLoader extends (...args: any[]) => infer R ? Awaited<R> : undefined,
  ) => TComponent | Promise<TComponent>;
  revalidate?: number;
}): Route<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TLoader extends (...args: any[]) => infer R ? Awaited<R> : undefined,
  TComponent
> {
  return route;
}

export function matchRoute(path: string, urlPath: string): { matches: boolean; params: Record<string, string> } {
  const pathSegments = path.split('/').filter(Boolean);
  // Strip query parameters for matching
  const cleanUrlPath = urlPath.split('?')[0] || '';
  const urlSegments = cleanUrlPath.split('/').filter(Boolean);

  if (pathSegments.length !== urlSegments.length) {
    return { matches: false, params: {} };
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < pathSegments.length; i++) {
    const pathSeg = pathSegments[i]!;
    const urlSeg = urlSegments[i]!;

    if (pathSeg.startsWith(':')) {
      params[pathSeg.slice(1)] = urlSeg;
    } else if (pathSeg !== urlSeg) {
      return { matches: false, params: {} };
    }
  }

  return { matches: true, params };
}

export async function resolveRoute<TComponent extends Control = Control>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  routes: Route<any, TComponent>[],
  urlString: string,
) {
  const url = new URL(urlString, 'http://localhost');
  const path = url.pathname;

  for (const route of routes) {
    const match = matchRoute(route.path, path);
    if (match.matches) {
      let data = null;
      if (route.loader) {
        data = await route.loader({ url, params: match.params });
      }
      return { route, data };
    }
  }

  return null;
}

export * from './client.js';
