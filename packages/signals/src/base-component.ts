import type { Props } from '@control.ts/control';
import { BaseComponent as CoreBaseComponent, type PossibleChild } from '@control.ts/control';
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

export class BaseComponent<T extends HTMLElement = HTMLElement> extends CoreBaseComponent<
  T,
  SignalProps<T>,
  BaseComponentChild<HTMLElement>
> {
  private static readonly readonlyProps = new Set(['tag', 'tagName', 'txt', 'style']);

  protected override applyProps(props: SignalProps<T>): void {
    if (props.txt) {
      (props as unknown as Record<string, unknown>).textContent = props.txt;
    }
    if (props.style) {
      this.applyStyle(props.style);
    }
    const node = this._node as Record<string, unknown>;
    for (const [key, value] of Object.entries(props)) {
      if (BaseComponent.readonlyProps.has(key)) {
        continue;
      }
      node[key] = getValue$(value);
      if (isSignal(value)) {
        this.subscriptions.push(value.subscribe((newValue) => (node[key] = newValue)));
      }
    }
  }

  public override append(child: NonNullable<BaseComponentChild<HTMLElement>>): void {
    if (child instanceof BaseComponent) {
      this._node.append(child.node);
      this.children.push(child);
      child.parent = this;
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
              value.parent = this;
            }
            const node = isComponent ? value.node : value;
            if (prevValue !== null) {
              if (prevValue instanceof BaseComponent) {
                this.children.push(prevValue);
                prevValue.parent = this;
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
}
