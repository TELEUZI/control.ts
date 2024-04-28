import type { Laziness, Priority } from '../optimized-image';
import { getPriorityByLaziness } from './priority';

interface LoadingProps {
  fetchPriority: Priority;
  loading?: Laziness;
  tag: 'img';
}

export const createImageProps = (laziness: Laziness): LoadingProps => ({
  fetchPriority: getPriorityByLaziness(laziness),
  loading: laziness,
  tag: 'img',
});
