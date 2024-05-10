import type { Laziness, Priority } from '../optimized-image';

const priority: Record<string, Priority> = {
  browser: 'low',
  intersection: 'low',
  eager: 'high',
};

/** @internal */
export const getPriorityByLaziness = (laziness: Laziness) => priority[laziness] ?? 'low';
