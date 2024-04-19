import type { ComponentChild, ComponentProps, Props } from '@control.ts/control';
import { Control, initObserver, isNotNullable, registerComponent } from '@control.ts/control';

export type BaseComponentProps<T extends HTMLElement = HTMLElement> = ComponentProps<T>;
export type BaseComponentChild<T extends HTMLElement = HTMLElement> = ComponentChild<T, BaseComponent>;

initObserver();
export class BaseComponent<T extends HTMLElement = HTMLElement> extends Control<T> {
  protected _node: T;

  constructor(p: BaseComponentProps<T>, ...children: BaseComponentChild[]) {
    super();
    p.txt && (p.textContent = p.txt);
    const node = document.createElement(p.tag ?? 'div') as T;
    Object.assign(node, p);
    this._node = node;
    if (p.style) {
      this.applyStyle(p.style);
    }
    if (children.length > 0) {
      this.appendChildren(children);
    }
    registerComponent(this);
  }

  public append<C extends HTMLElement>(child: BaseComponent<C> | HTMLElement): void {
    if (child instanceof BaseComponent) {
      this._node.append(child.node);
    } else {
      this._node.append(child);
    }
  }

  public appendChildren(possibleChildren: (BaseComponentChild | null)[]): void {
    const children = possibleChildren.filter(isNotNullable);
    for (const child of children) {
      this.append(child);
    }
  }

  public replaceWith(child: BaseComponent | HTMLElement | Comment): void {
    this._node.replaceWith(child instanceof BaseComponent ? child.node : child);
  }
}

export function bc$<T extends HTMLElement = HTMLElement>(props: Props<T>, ...children: BaseComponentChild[]) {
  return new BaseComponent<T>(props, ...children);
}
