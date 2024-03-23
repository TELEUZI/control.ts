export function isNullable(value: unknown): value is null | undefined {
  return value == null;
}

export function isNotNullable<T>(value: T): value is NonNullable<T> {
  return value != null;
}
