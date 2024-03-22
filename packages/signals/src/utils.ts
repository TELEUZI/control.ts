import { Signal } from '@preact/signals-core';

export function isSignal<T>(value: T | Signal<T>): value is Signal<T> {
  return value instanceof Signal;
}

export function getValue<T>(value: T | Signal<T>): T {
  return isSignal(value) ? value.value : value;
}

export type Signalize<T> = T | Signal<T>;
