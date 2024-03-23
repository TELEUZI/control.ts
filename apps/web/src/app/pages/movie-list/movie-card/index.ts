import { ImageWithPlaceholder } from '@components/img/img';
import { div, div$ } from '@control.ts/signals';
import type { Movie } from '@interfaces/movie.interface';

import styles from './styles.module.scss';

interface Props {
  movie: Movie;
  onClick: () => void;
}

export const MovieCard = ({ movie, onClick }: Props) =>
  div$(
    {
      className: styles.card,
      onclick: () => {
        onClick();
      },
    },
    ImageWithPlaceholder({
      src: movie.posterUrlPreview,
      className: styles.poster,
    }),
    div({
      className: styles.title,
      txt: movie.nameRu,
    }),
    div({
      className: styles.year,
      txt: movie.year.toString(),
    }),
    div({
      className: styles.genres,
      txt: movie.genres.map(({ genre }) => genre).join(', '),
    }),
  );
