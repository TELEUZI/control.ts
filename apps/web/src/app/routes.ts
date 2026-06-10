import type { Route } from '@control.ts/router';
import { main$ } from '@control.ts/signals';

import { MovieListPage } from './pages/movie-list';
import { movieService } from './services/movie.service';

export const routes: Route[] = [
  {
    path: '/',
    component: (data) => main$({ className: 'main' }, MovieListPage(movieService, data?.movies)),
    loader: async () => {
      const initialMovies = await movieService.getMovies({ page: 1, limit: 12 }, false);
      return { movies: initialMovies };
    },
    revalidate: 60, // Cache for 60 seconds
  },
  {
    path: '/about',
    component: async (data) => {
      const { AboutPage } = await import('./pages/about/index.js');
      return main$({ className: 'main' }, AboutPage(data));
    },
    loader: () => {
      // Return dummy data just to prove loaders work for all pages
      return { version: '1.0.0 (SSR)' };
    },
    revalidate: 3600, // Cache for 1 hour
  },
];
