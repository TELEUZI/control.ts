import type { Props } from '@control.ts/control';
import { Control, isNotNullable, type PossibleChild } from '@control.ts/control';
import { Signal } from '@preact/signals-core';

import { isSignal } from './utils';

export type SignalProps<T extends HTMLElement = HTMLElement> = {
  [K in keyof Props<T>]: Signal<Props<T>[K]> | Props<T>[K];
} & {
  tag?: keyof HTMLElementTagNameMap;
  style?: Partial<CSSStyleDeclaration>;
};

export type BaseComponentProps<T extends HTMLElement = HTMLElement> = SignalProps<T>;

export type BaseComponentChild<T extends HTMLElement = HTMLElement> =
  | PossibleChild<T, BaseComponent<T>>
  | Signal<BaseComponent<T> | null>;

export class BaseComponent<T extends HTMLElement = HTMLElement> extends Control<T> {
  protected _node: T;

  public override children: BaseComponent[] = [];

  constructor(p: SignalProps<T>, ...children: BaseComponentChild[]) {
    super();
    this._node = document.createElement(p.tag ?? 'div') as T;
    if (p.txt) {
      p.textContent = p.txt;
    }
    this.applyProps(p);
    if (p.style) {
      this.applyStyle(p.style);
    }
    if (children.length > 0) {
      this.appendChildren(children);
    }
  }

  private applyProps(p: SignalProps<T>) {
    const node = this._node as Record<string, unknown>;
    for (const [key, value] of Object.entries(p)) {
      if (key === 'tag' || key === 'tagName' || key === 'txt' || key === 'style') {
        continue;
      }
      if (isSignal(value)) {
        const sub = value.subscribe((newValue) => {
          node[key] = newValue;
        });
        this.subscriptions.push(sub);
        node[key] = value.value;
      } else {
        node[key] = value;
      }
    }
  }

  public append(child: NonNullable<BaseComponentChild>): void {
    if (child instanceof BaseComponent) {
      this._node.append(child.node);
      this.children.push(child);
    } else if (child instanceof Signal) {
      const empty = document.createComment('comment');
      this._node.append(empty);
      let prevValue: PossibleChild<HTMLElement, BaseComponent> = null;
      this.subscriptions.push(
        child.subscribe((value) => {
          if (value !== null) {
            const isComponent = value instanceof BaseComponent;
            if (isComponent) {
              this.children.push(value);
            }
            const node = isComponent ? value.node : value;
            if (prevValue !== null) {
              if (prevValue instanceof BaseComponent) {
                this.children.push(prevValue);
              }
              prevValue.replaceWith(node);
            } else {
              empty.replaceWith(node);
            }
            prevValue = value;
          } else if (prevValue !== null) {
            prevValue.replaceWith(empty);
            if (prevValue instanceof BaseComponent) {
              this.removeFromChildren(prevValue);
            }
            prevValue = null;
          }
        }),
      );
    } else {
      this._node.append(child);
    }
  }

  public appendChildren(children: BaseComponentChild[]): void {
    children.filter(isNotNullable).forEach((el) => {
      this.append(el);
    });
  }

  public replaceWith(child: BaseComponent | HTMLElement | Comment): void {
    this._node.replaceWith(child instanceof BaseComponent ? child.node : child);
  }
}

export function bc$<T extends HTMLElement = HTMLElement>(props: Props<T>, ...children: BaseComponentChild[]) {
  return new BaseComponent<T>(props, ...children);
}
