import { BaseComponent, main$ } from '@control.ts/signals';
import { movieService } from '@services/movie.service';

import { Header } from './components/header/header';
import { MovieListPage } from './pages/movie-list';

class PageWrapperComponent extends BaseComponent {
  constructor() {
    console.log('PageWrapperComponent');
    super(
      {
        className: 'page-wrapper',
      },
      Header(),
      main$({ className: 'main' }, MovieListPage(movieService)),
    );
  }
}

export const PageWrapper = () => new PageWrapperComponent();
