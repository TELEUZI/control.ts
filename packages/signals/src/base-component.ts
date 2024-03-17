import { Signal } from '@preact/signals-core';

import { isNotNullable } from './utils/is-nullable';

export type Props<T extends HTMLElement = HTMLElement> = Partial<
  Omit<T, 'style' | 'classList' | 'children' | 'tagName'>
> & {
  txt?: string;
  tag?: keyof HTMLElementTagNameMap;
  style?: Partial<CSSStyleDeclaration>;
};

export type SignalProps<T extends HTMLElement = HTMLElement> = {
  [K in keyof Props<T>]: Signal<Props<T>[K]> | Props<T>[K];
} & {
  tag?: keyof HTMLElementTagNameMap;
  style?: Partial<CSSStyleDeclaration>;
};

export type Unsubscribe = () => void;

function isSignal<T>(value: T | Signal<T>): value is Signal<T> {
  return value instanceof Signal;
}

export type PossibleChild = HTMLElement | BaseComponent | null;

export class BaseComponent<T extends HTMLElement = HTMLElement> {
  protected _node: T;

  public subscriptions: Unsubscribe[] = [];

  constructor(p: SignalProps<T>, ...children: (PossibleChild | Signal<PossibleChild>)[]) {
    this._node = document.createElement(p.tag ?? 'div') as T;
    p.textContent = p.txt;
    this.applyProps(p);
    if (p.style) {
      this.applyStyle(p.style);
    }
    if (children.length > 0) {
      this.appendChildren(children);
    }
  }

  public get node(): Readonly<T> {
    return this._node;
  }

  private applyProps(p: SignalProps<T>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const node: Record<string, any> = this._node;
    Object.entries(p).forEach(([key, value]) => {
      if (isSignal(value)) {
        const sub = value.subscribe((newValue) => {
          node[key] = newValue;
        });
        this.subscriptions.push(sub);
        node[key] = value.value;
      } else {
        node[key] = value;
      }
    });
  }

  private applyStyle(style: Partial<CSSStyleDeclaration>): void {
    Object.entries(style).forEach(([key, value]) => {
      // @ts-expect-error - TS doesn't like the fact that we're using a string index to access the style object
      this._node.style[key] = value;
    });
  }

  public append(child: NonNullable<PossibleChild> | Signal<PossibleChild | null>): void {
    if (child instanceof BaseComponent) {
      this._node.append(child.node);
    } else if (child instanceof Signal) {
      const empty = document.createComment('comment');
      this._node.append(empty);
      let prevValue: PossibleChild | null = null;
      this.subscriptions.push(
        child.subscribe((value) => {
          console.log(value, prevValue);
          if (value !== null && prevValue == null) {
            empty.replaceWith(value instanceof BaseComponent ? value.node : value);
            prevValue = value;
          } else if (value === null && prevValue !== null) {
            prevValue.replaceWith(empty);
          } else if (value !== null && prevValue !== null) {
            prevValue.replaceWith(value instanceof BaseComponent ? value.node : value);
            prevValue = value;
          }
        }),
      );
    } else {
      this._node.append(child);
    }
  }

  public appendChildren(children: (PossibleChild | Signal<PossibleChild | null>)[]): void {
    children.filter(isNotNullable).forEach((el) => {
      this.append(el);
    });
  }

  public setTextContent(text: string): void {
    this._node.textContent = text;
  }

  public replaceWith(child: NonNullable<PossibleChild> | Comment) {
    const newNode = child instanceof BaseComponent ? child.node : child;
    this._node.replaceWith(newNode);
    this._node = newNode as T;
  }

  public addClass(className: string): void {
    this._node.classList.add(className);
  }

  public toggleClass(className: string): void {
    this._node.classList.toggle(className);
  }

  public removeClass(className: string): void {
    this._node.classList.remove(className);
  }

  public destroy(): void {
    this._node.remove();
    this.subscriptions.forEach((sub) => sub());
  }

  public toString(): string {
    return this._node.outerHTML;
  }

  public subscribe(subscription: Unsubscribe): void {
    this.subscriptions.push(subscription);
  }

  public unsubscribeAll(): void {
    this.subscriptions.forEach((sub) => sub());
  }
}

export function bc$<T extends HTMLElement = HTMLElement>(props: Props<T>, ...children: PossibleChild[]) {
  return new BaseComponent<T>(props, ...children);
}
