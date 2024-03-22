export function isNotNullable<T>(value: T): value is NonNullable<T> {
  return value != null;
}
