import type { Signal } from '@preact/signals-core';

export function isSignal<T>(value: unknown | Signal<T>): value is Signal<T> {
  return value != null && typeof value === 'object' && 'subscribe' in value;
}

export function getValue$<T>(value: T | Signal<T>): T {
  return isSignal(value) ? value.value : value;
}

export type Signalize<T> = T | Signal<T>;
