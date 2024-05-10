import type { Laziness, Priority } from '../optimized-image';
import { getPriorityByLaziness } from './priority';

interface Props {
  fetchpriority: Priority;
  loading?: Laziness;
  tag: 'img';
}

/** @internal */
export const createImageProps = (laziness: Laziness): Props => ({
  fetchpriority: getPriorityByLaziness(laziness),
  loading: laziness,
  tag: 'img',
});
