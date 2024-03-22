import { ImageWithPlaceholder } from '@components/img/img';
import { iconFromCode } from '@components/tags';
import { Timer } from '@components/timer/timer';
import type { Signal } from '@control.ts/signals';
import { $$, BaseComponent, div, div$, h3, span } from '@control.ts/signals';
import type { MovieWithFavorite } from '@interfaces/movie.interface';

import styles from './styles.module.scss';

interface Props {
  movie: MovieWithFavorite;
  onMakeFavorite: () => void;
  isFavorite: Signal<boolean>;
}

class MovieInfoComponent extends BaseComponent {
  constructor({ movie, onMakeFavorite, isFavorite }: Props) {
    isFavorite.subscribe((value) => {
      console.log('isFavorite', value);
    });
    super(
      { className: styles.info },
      ImageWithPlaceholder({
        src: movie.posterUrlPreview,
        className: styles.poster,
      }),
      div$(
        {},
        h3({
          className: styles.waitForPremiere,
          txt: 'Wait for the premiere',
        }),
        Timer(new Date(movie.premiereRu).getTime()),
      ),
      div({
        className: styles.description,
        txt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sodales, ligula ornare sodales mattis, tellus lectus porttitor diam, vitae porta mi arcu ac nunc. Nam quam erat, aliquet at sodales id, consectetur a ligula. Mauris ut nunc sodales, efficitur neque eget, euismod massa.',
      }),
      div({ className: styles.row }, div({ txt: 'Year' }), div({ className: styles.year, txt: movie.year.toString() })),
      div(
        { className: styles.row },
        div({ txt: 'Genres' }),
        div({ className: styles.genres, txt: movie.genres.map(({ genre }) => genre).join(', ') }),
      ),
      div(
        { className: styles.row },
        div({ txt: 'Duration' }),
        div({ className: styles.duration, txt: `${movie.duration}m` }),
      ),
      div(
        { className: styles.row },
        div({ txt: 'Countries' }),
        div({ className: styles.countries, txt: movie.countries.map(({ country }) => country).join(', ') }),
      ),
      div(
        { className: styles.row },
        div({ txt: 'Premiere' }),
        div({ className: styles.premiere, txt: movie.premiereRu }),
      ),
      div(
        { className: styles.title, onclick: onMakeFavorite },
        span({ txt: 'Add to favorite' }),
        iconFromCode(
          {
            className: $$(() => `${styles.favoriteButton} ${isFavorite.value && styles.favorite}`),
          },
          '&#x2605;',
        ).node,
      ),
    );
  }
}

export const MovieInfo = (props: Props) => new MovieInfoComponent(props);
