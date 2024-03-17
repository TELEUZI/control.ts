import type { PossibleChild, SignalProps } from './base-component';
import { BaseComponent } from './base-component';

type TagName = keyof HTMLElementTagNameMap;
export type ElementFnProps<T extends HTMLElement = HTMLElement> = Omit<SignalProps<T>, 'tag'>;

export function createElement<T extends TagName>(tag: T, props: ElementFnProps, ...children: HTMLElement[]) {
  const node = document.createElement(tag);
  props.textContent = props.txt;
  Object.assign(node, props);
  children.forEach((child) => node.append(child));
  return node;
}

export function createElementFactory<T extends TagName>(tag: T) {
  return (props: ElementFnProps<HTMLElementTagNameMap[T]>, ...children: HTMLElement[]) =>
    createElement(tag, props, ...children);
}

export function createElementFactoryWithCustomProps<T extends TagName, P extends Partial<ElementFnProps>>(
  tag: T,
  props: P,
) {
  return (customProps: Partial<P>, ...children: HTMLElement[]) =>
    createElement<T>(tag, { ...props, ...customProps }, ...children);
}

export function createElement$<T extends TagName>(
  props: SignalProps<HTMLElementTagNameMap[T]> & { tag: T },
  children?: PossibleChild[],
) {
  return new BaseComponent<HTMLElementTagNameMap[T]>(props, ...(children ?? []));
}

export function createElementFactory$<T extends TagName>(tag: T) {
  return (props: SignalProps<HTMLElementTagNameMap[T]>, ...children: PossibleChild[]) =>
    createElement$({ tag, ...props }, children);
}
