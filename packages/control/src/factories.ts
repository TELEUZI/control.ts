import type { Control, Props } from './control';
import { isServerEnvironment } from './ssr';
import { VirtualNode } from './virtual-node';

export type TagName = keyof HTMLElementTagNameMap;
export type ElementFnProps<T extends HTMLElement = HTMLElement> = Omit<Props<T>, 'tag'>;

export function createElement<T extends TagName>(
  tag: T,
  props: ElementFnProps,
  children: HTMLElement[],
): HTMLElementTagNameMap[T] {
  const node = (isServerEnvironment() ? new VirtualNode(tag) : document.createElement(tag)) as HTMLElementTagNameMap[T];
  if (props.txt) {
    node.textContent = props.txt;
  }
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

export interface ElementFactory<
  Props extends Record<string, unknown>,
  Child,
  CompClass extends Control<HTMLElement>,
  Tag extends TagName,
> {
  <T extends HTMLElement = HTMLElementTagNameMap[Tag]>(
    props: Props & { tag?: Tag },
    ...children: Child[]
  ): CompClass & { node: T };
}

export type ComponentConstructor<
  Props extends Record<string, unknown>,
  Child,
  CompClass extends Control<HTMLElement>,
> = {
  new (props: Props & { tag?: TagName }, ...children: Child[]): CompClass;
};

export function createElementFactoryFabric<
  BaseComponentProps extends Record<string, unknown>,
  BaseComponentChild,
  BaseComponentClass extends Control<HTMLElement>,
>(Constructor: ComponentConstructor<BaseComponentProps, BaseComponentChild, BaseComponentClass>) {
  return <Tag extends TagName>(tag: Tag) => {
    return <T extends HTMLElement = HTMLElementTagNameMap[Tag]>(
      props: Omit<BaseComponentProps, 'tag'> & { tag?: Tag },
      ...children: BaseComponentChild[]
    ): BaseComponentClass & { node: T } => {
      return new Constructor(
        { tag, ...props } as unknown as BaseComponentProps,
        ...children,
      ) as unknown as BaseComponentClass & { node: T };
    };
  };
}
