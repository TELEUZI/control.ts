/**
 * Server Entry Point for SSR
 *
 * This module handles server-side rendering of the movie app.
 */

import { resolveRoute } from '@control.ts/router';
import { h1$, renderComponentToString } from '@control.ts/signals';

import { PageWrapper } from '../src/app/page.js';
import { routes } from '../src/app/routes.js';

export { routes };

export async function render(url: string) {
  // Resolve the route and its data
  const resolved = await resolveRoute(routes, url);

  if (!resolved) {
    const html = renderComponentToString(PageWrapper(h1$({ txt: '404 Not Found' })));
    return { html, head: '', revalidate: undefined };
  }

  // Create the app component using the resolved route's component and data
  const comp = await resolved.route.component(resolved.data);
  const app = PageWrapper(comp);

  // Render just the component to HTML string
  const html = renderComponentToString(app);

  // Return the rendered HTML and initial data
  return {
    html,
    head: `
      <script>
        window.__INITIAL_DATA__ = ${JSON.stringify(resolved.data).replace(/</g, '\\u003c')};
      </script>
    `,
    revalidate: resolved.route.revalidate,
  };
}
