import type { Laziness } from '../optimized-image';

export const imageLoading = (laziness: Laziness): { loading?: Exclude<Laziness, 'intersection'> } => {
  if (laziness === 'intersection') {
    return {};
  }

  return {
    loading: laziness,
  };
};
