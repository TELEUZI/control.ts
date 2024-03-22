import type { Props } from './control';

export type TagName = keyof HTMLElementTagNameMap;
export type ElementFnProps<T extends HTMLElement = HTMLElement> = Omit<Props<T>, 'tag'>;

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