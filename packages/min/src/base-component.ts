import type { ComponentChild, ComponentProps, Props } from '@control.ts/control';
import { Control, isNotNullable } from '@control.ts/control';

export type BaseComponentProps<T extends HTMLElement = HTMLElement> = ComponentProps<T>;
export type BaseComponentChild<T extends HTMLElement = HTMLElement> = ComponentChild<T, BaseComponent>;

export class BaseComponent<T extends HTMLElement = HTMLElement> extends Control<T> {
  protected _node: T;

  public override children: BaseComponent[] = [];

  constructor(p: ComponentProps<T>, ...children: BaseComponentChild[]) {
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

  public stylize<K extends keyof CSSStyleDeclaration>(style: K, value: CSSStyleDeclaration[K]): void;
  public stylize(style: Partial<CSSStyleDeclaration>): void;
  public stylize<K extends keyof CSSStyleDeclaration>(
    style: K | Partial<CSSStyleDeclaration>,
    value?: CSSStyleDeclaration[K],
  ): void {
    if (typeof style !== 'object' && value) {
      this._node.style[style] = value;
      return;
    }

    Object.assign(this._node.style, style);
  }

  public unstylize<K extends keyof CSSStyleDeclaration>(...keys: K[]) {
    keys.forEach((key) => this._node.style.removeProperty(key.toString()));
  }
}

export function bc$<T extends HTMLElement = HTMLElement>(props: Props<T>, ...children: BaseComponentChild[]) {
  return new BaseComponent<T>(props, ...children);
}
