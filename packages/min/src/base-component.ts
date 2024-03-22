import type { PossibleChild, Props } from '@control.ts/control';
import { Control } from '@control.ts/control';

import { isNotNullable } from './utils/is-nullable';

export type BaseComponentProps<T extends HTMLElement = HTMLElement> = Props<T>;

export type BaseComponentChild<T extends HTMLElement = HTMLElement> = PossibleChild<T, BaseComponent<T>>;

export class BaseComponent<T extends HTMLElement = HTMLElement> extends Control<T> {
  protected _node: T;

  public override children: BaseComponent[] = [];

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
  }

  public append(child: NonNullable<BaseComponentChild>): void {
    if (child instanceof BaseComponent) {
      this._node.append(child.node);
      this.children.push(child);
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
}

export function bc$<T extends HTMLElement = HTMLElement>(props: Props<T>, ...children: BaseComponentChild[]) {
  return new BaseComponent<T>(props, ...children);
}
