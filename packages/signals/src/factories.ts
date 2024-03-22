import type { TagName } from '@control.ts/control';

import type { BaseComponentChild, BaseComponentProps } from './base-component';
import { BaseComponent } from './base-component';

export type { ElementFnProps, TagName } from '@control.ts/control';
export { createElement, createElementFactory, createElementFactoryWithCustomProps } from '@control.ts/control';

export function createElement$<T extends TagName>(
  props: BaseComponentProps<HTMLElementTagNameMap[T]> & { tag: T },
  children?: BaseComponentChild[],
) {
  return new BaseComponent<HTMLElementTagNameMap[T]>(props, ...(children ?? []));
}

export function createElementFactory$<T extends TagName>(tag: T) {
  return (props: BaseComponentProps<HTMLElementTagNameMap[T]>, ...children: BaseComponentChild[]) =>
    createElement$({ tag, ...props }, children);
}
