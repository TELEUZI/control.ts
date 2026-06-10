import type { Props } from './control';
import { getSSRContext, isServerEnvironment, renderToString } from './ssr';

type TagName = keyof HTMLElementTagNameMap;
type ElementFnProps<T extends HTMLElement = HTMLElement> = Omit<Props<T>, 'tag'>;

/**
 * Universal createElement that works in both browser and Node.js
 */
export function createElementUniversal<T extends TagName>(
  tag: T,
  props: ElementFnProps<HTMLElementTagNameMap[T]>,
  children: Array<HTMLElement | string>,
): HTMLElement | string {
  const ssrContext = getSSRContext();

  // If in SSR mode, render to string
  if (ssrContext?.isServer || isServerEnvironment()) {
    return renderToString(tag, props, children);
  }

  // Browser mode - create actual DOM element
  const node = document.createElement(tag);
  props.textContent = props.txt;
  Object.assign(node, props);

  // Handle children
  for (const child of children) {
    if (typeof child === 'string') {
      node.appendChild(document.createTextNode(child));
    } else {
      node.appendChild(child);
    }
  }

  return node;
}

/**
 * Create element factory that works universally
 */
export function createElementFactoryUniversal<T extends TagName>(tag: T) {
  return (props: ElementFnProps<HTMLElementTagNameMap[T]>, ...children: Array<HTMLElement | string>) =>
    createElementUniversal(tag, props, children);
}

/**
 * Create element factory with custom props (universal)
 */
export function createElementFactoryWithCustomPropsUniversal<
  T extends TagName,
  P extends Partial<ElementFnProps<HTMLElementTagNameMap[T]>>,
>(tag: T, defaultProps: P) {
  return (customProps: Partial<P>, ...children: Array<HTMLElement | string>) =>
    createElementUniversal<T>(
      tag,
      { ...defaultProps, ...customProps } as ElementFnProps<HTMLElementTagNameMap[T]>,
      children,
    );
}

/**
 * Virtual DOM node type for SSR
 */
export type VNode = {
  tag: TagName;
  props: ElementFnProps;
  children: Array<VNode | string>;
  key?: string | number;
};

/**
 * Create virtual node
 */
export function h<T extends TagName>(
  tag: T,
  props: ElementFnProps<HTMLElementTagNameMap[T]> | null,
  ...children: Array<VNode | string>
): VNode {
  return {
    tag,
    props: props || {},
    children,
  };
}

/**
 * Render VNode to HTML string
 */
export function renderVNode(vnode: VNode | string): string {
  if (typeof vnode === 'string') {
    return vnode;
  }

  const childrenHtml = vnode.children.map(renderVNode);
  return renderToString(vnode.tag, vnode.props, childrenHtml);
}

/**
 * Convert VNode to DOM element
 */
export function vNodeToElement(vnode: VNode | string): HTMLElement | Text {
  if (typeof vnode === 'string') {
    return document.createTextNode(vnode);
  }

  const element = document.createElement(vnode.tag);

  // Apply props
  for (const [key, value] of Object.entries(vnode.props)) {
    if (key === 'txt' || key === 'textContent') {
      element.textContent = String(value);
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key === 'className') {
      element.className = String(value);
    } else if (value !== undefined && value !== null) {
      (element as Record<string, unknown>)[key] = value;
    }
  }

  // Add children
  for (const child of vnode.children) {
    element.appendChild(vNodeToElement(child));
  }

  return element;
}

/**
 * JSX-like createElement function (for future JSX support)
 */
// function createElement<T extends TagName>(
//   tag: T,
//   props: ElementFnProps<HTMLElementTagNameMap[T]> | null,
//   ...children: Array<VNode | string>
// ): VNode {
//   return h(tag, props, ...children);
// }

/**
 * Fragment component (for grouping children without a wrapper)
 */
export function Fragment(props: { children: Array<VNode | string> }): Array<VNode | string> {
  return props.children;
}
