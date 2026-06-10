/**
 * Client Entry Point for SSR Hydration
 *
 * This module handles client-side hydration of the server-rendered app.
 */

import './styles/style.css';

import type { BaseComponent } from '@control.ts/signals';
import { mountWithHydration } from '@control.ts/signals';
import { hydrateClient } from '@control.ts/ssr/client';

import { PageWrapper } from './app/page';
import { routes } from './app/routes';

// The Vite environment sets BASE_URL, injected during build.
const base = import.meta.env?.BASE_URL || '/movie-app/';

hydrateClient<BaseComponent>({
  routes,
  base,
  mount: (component) =>
    mountWithHydration(document.querySelector<HTMLDivElement>('#app')!, () => PageWrapper(component)),
});
