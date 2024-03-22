import { Button } from '@components/button/button';
import { Loader } from '@components/loader/loader';
import { ModalWindow } from '@components/modal/modal-window';
import type { Signal } from '@control.ts/signals';
import { $, $$, BaseComponent, div, div$, effect, input } from '@control.ts/signals';
import type { MovieWithFavorite } from '@interfaces/movie.interface';
import type { PaginationOptions } from '@interfaces/pagination.interface';
import type { MovieService } from '@services/movie.service';

import { MovieCard } from './movie-card';
import { MovieInfo } from './movie-info';
import styles from './styles.module.scss';

class MovieListPageComponent extends BaseComponent {
  private readonly isLoading = $(false);
  private readonly paginationOptions: PaginationOptions = {
    page: 1,
    limit: 12,
  };
  private readonly hasMore: Signal<boolean> = $(false);

  private readonly favoriteOnly = $(false);
  private readonly movies: Signal<MovieWithFavorite[]> = $([]);

  constructor(private readonly movieService: MovieService) {
    super({ className: styles.movieListPage });
    effect(() => {
      this.paginationOptions.page = 1;
      this.movies.value = [];
      this.loadMovies(this.favoriteOnly.value);
    });

    this.appendChildren([
      div(
        { className: styles.titleContainer },
        div({ className: styles.title, txt: 'Movies' }),
        div(
          { className: styles.favoriteSwitcher },
          div({ txt: 'Favorite only' }),
          input({
            type: 'checkbox',
            onchange: () => {
              this.favoriteOnly.value = !this.favoriteOnly.value;
              this.paginationOptions.page = 1;
              this.movies.value = [];
              this.loadMovies(this.favoriteOnly.value);
            },
          }),
        ),
      ),
      $$(() =>
        this.movies.value.length > 0
          ? div$(
              { className: styles.movieList },
              ...this.movies.value.map((movie) =>
                MovieCard({
                  movie,
                  onClick: () => {
                    this.showMovieModal(movie);
                  },
                }),
              ),
            )
          : null,
      ),
      $$(() => (this.isLoading ? Loader(this.isLoading) : null)),
      $$(() =>
        this.hasMore
          ? Button({
              txt: 'Load more',
              onClick: () => {
                this.paginationOptions.page++;
                this.loadMovies(this.favoriteOnly.value);
              },
              className: $$(() => (this.hasMore.value ? '' : 'hidden')),
            })
          : null,
      ),
    ]);
  }

  public async loadMovies(favoriteOnly: boolean) {
    this.isLoading.value = true;
    const { data: movies, hasMore } = await this.movieService.getMovies(this.paginationOptions, favoriteOnly);
    this.isLoading.value = false;
    this.movies.value = [...this.movies.value, ...movies];
    this.hasMore.value = hasMore;
  }

  public showMovieModal(movie: MovieWithFavorite) {
    const isFavorite = $(movie.isFavorite ?? false);
    const movieDescription = MovieInfo({
      movie,
      onMakeFavorite: () => {
        this.movieService.updateFavoriteMovies(movie.kinopoiskId.toString());
        isFavorite.value = !isFavorite.value;
      },
      isFavorite,
    });
    const modal = ModalWindow({
      title: movie.nameRu,
      description: movieDescription,
    });
    modal.open(this.node);
  }
}

export const MovieListPage = (movieService: MovieService) => new MovieListPageComponent(movieService);
