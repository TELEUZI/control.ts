import type { Props } from './control';

export type TagName = keyof HTMLElementTagNameMap;
export type ElementFnProps<T extends HTMLElement = HTMLElement> = Omit<Props<T>, 'tag'>;

export function createElement<T extends TagName>(tag: T, props: ElementFnProps, children: HTMLElement[]) {
  const node = document.createElement(tag);
  props.textContent = props.txt;
  Object.assign(node, props);
  node.append(...children);
  return node;
}

export function createElementFactory<T extends TagName>(tag: T) {
  return (props: ElementFnProps<HTMLElementTagNameMap[T]>, ...children: HTMLElement[]) =>
    createElement(tag, props, children);
}

export function createElementFactoryWithCustomProps<T extends TagName, P extends Partial<ElementFnProps>>(
  tag: T,
  props: P,
) {
  return (customProps: Partial<P>, ...children: HTMLElement[]) =>
    createElement<T>(tag, { ...props, ...customProps }, children);
}

// TODO: implement common logic for min/signals fabrics and remove code duplicates

// export function createElementFactoryFabric<
//   T extends {
//     new <C extends Control<V>, V extends HTMLElement>(...args: any[]): C;
//   },
//   BaseComponentProps,
//   BaseComponentChild,
// >(bs: T) {
//   function createElement$<Tag extends TagName, C extends Control<HTMLElementTagNameMap[Tag]>>(
//     props: BaseComponentProps & { tag: Tag },
//     children?: BaseComponentChild[],
//   ) {
//     return new bs<C, HTMLElementTagNameMap[Tag]>(props, ...(children ?? []));
//   }
//   return <Tag extends TagName, C extends Control<HTMLElementTagNameMap[Tag]>>(tag: Tag) => {
//     return (props: BaseComponentProps, ...children: BaseComponentChild[]) =>
//       createElement$<Tag, C>({ tag, ...props }, children);
//   };
// }
