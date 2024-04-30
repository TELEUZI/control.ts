export const objectFromEntries = <K extends PropertyKey, T>(array: [K, T][]): Record<K, T> =>
  Object.fromEntries(array) as Record<K, T>;
