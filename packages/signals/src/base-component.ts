import type { Props } from '@control.ts/control';
import { Control, isNotNullable, type PossibleChild } from '@control.ts/control';
import type { Signal } from '@preact/signals-core';

import { getValue$, isSignal } from './utils';

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

  protected children: BaseComponent[] = [];
  private readonly readonlyProps = new Set(['tag', 'tagName', 'txt', 'style']);

  constructor(props: SignalProps<T>, ...children: BaseComponentChild[]) {
    super();
    this._node = document.createElement(props.tag ?? 'div') as T;
    if (props.txt) {
      props.textContent = props.txt;
    }
    this.applyProps(props);
    if (props.style) {
      this.applyStyle(props.style);
    }
    if (children.length > 0) {
      this.appendChildren(children);
    }
  }

  private applyProps(props: SignalProps<T>) {
    const node = this._node as Record<string, unknown>;
    for (const [key, value] of Object.entries(props)) {
      if (this.readonlyProps.has(key)) {
        continue;
      }
      node[key] = getValue$(value);
      if (isSignal(value)) {
        this.subscriptions.push(value.subscribe((newValue) => (node[key] = newValue)));
      }
    }
  }

  public append(child: NonNullable<BaseComponentChild>): void {
    if (child instanceof BaseComponent) {
      this._node.append(child.node);
      this.children.push(child);
    } else if (child instanceof HTMLElement) {
      this._node.append(child);
    } else {
      const empty = document.createComment('comment');
      this._node.append(empty);
      let prevValue: PossibleChild<HTMLElement, BaseComponent> = null;
      this.subscriptions.push(
        child.subscribe((value) => {
          if (value !== null) {
            const isComponent = value instanceof BaseComponent;
            if (isComponent) {
              // push to unsubscribe from children subs on destroy if needed
              this.children.push(value);
            }
            const node = isComponent ? value.node : value;
            if (prevValue !== null) {
              if (prevValue instanceof BaseComponent) {
                this.children.push(prevValue);
              }
              prevValue.replaceWith(node);
            } else {
              // if it is first rendering
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
