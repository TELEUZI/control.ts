import type { PossibleChild, Props } from './base-component';
import { BaseComponent } from './base-component';

type TagName = keyof HTMLElementTagNameMap;
export type ElementFnProps<T extends HTMLElement = HTMLElement> = Omit<Props<T>, 'tag'>;

export function createElement<T extends TagName>(tag: T, props: ElementFnProps, ...children: HTMLElement[]) {
  const node = document.createElement(tag);
  Object.assign(node, props);
  children.forEach((child) => node.append(child));
  return node;
}

export function createElementFactory<T extends TagName>(tag: T) {
  return (props: ElementFnProps, ...children: HTMLElement[]) => createElement(tag, props, ...children);
}

export function createElementFactoryWithCustomProps<T extends TagName, P extends Partial<ElementFnProps>>(
  tag: T,
  props: P,
) {
  return (customProps: Partial<P>, ...children: HTMLElement[]) =>
    createElement<T>(tag, { ...props, ...customProps }, ...children);
}

export function createElement$<T extends TagName>(
  props: Props<HTMLElementTagNameMap[T]> & { tag: T },
  children?: PossibleChild[],
) {
  return new BaseComponent<HTMLElementTagNameMap[T]>(props, ...(children ?? []));
}

export function createElementFactory$<T extends TagName>(tag: T) {
  return (props: Props<HTMLElementTagNameMap[T]>, ...children: PossibleChild[]) =>
    createElement$({ tag, ...props }, children);
}
