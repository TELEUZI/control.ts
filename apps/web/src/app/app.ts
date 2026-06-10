import { resolveRoute } from '@control.ts/router';
import { mount } from '@control.ts/signals';

import { PageWrapper } from './page';
import { routes } from './routes';

async function bootstrap() {
  const base = import.meta.env?.BASE_URL || '/movie-app/';
  let urlPath = window.location.pathname;
  if (urlPath.startsWith(base)) {
    urlPath = '/' + urlPath.slice(base.length);
  }
  urlPath = urlPath.replace('//', '/');

  const resolved = await resolveRoute(routes, urlPath);

  if (resolved) {
    const app = PageWrapper(resolved.route.component(resolved.data));
    mount(document.querySelector<HTMLDivElement>('#app')!, app);
  } else {
    document.querySelector('#app')!.innerHTML = '<h1>404 Not Found</h1>';
  }
}

bootstrap();
