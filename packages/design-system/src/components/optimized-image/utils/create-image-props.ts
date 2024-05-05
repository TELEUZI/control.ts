import type { Laziness, Priority } from '../optimized-image';
import { getPriorityByLaziness } from './priority';

interface LoadingProps {
  fetchpriority: Priority;
  loading?: Laziness;
  tag: 'img';
}

/** @internal */
export const createImageProps = (laziness: Laziness): LoadingProps => ({
  fetchpriority: getPriorityByLaziness(laziness),
  loading: laziness,
  tag: 'img',
});
