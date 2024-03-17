import { isNotNullable } from './utils/is-nullable';

export type Props<T extends HTMLElement = HTMLElement> = Partial<
  Omit<T, 'style' | 'classList' | 'children' | 'tagName'>
> & {
  txt?: string;
  tag?: keyof HTMLElementTagNameMap;
  style?: Partial<CSSStyleDeclaration>;
};

export type Unsubscribe = () => void;

export type PossibleChild<C extends HTMLElement = HTMLElement> = HTMLElement | BaseComponent<C> | null;

export class BaseComponent<T extends HTMLElement = HTMLElement, C extends HTMLElement = HTMLElement> {
  protected _node: T;

  protected children: BaseComponent<C>[] = [];

  public subscriptions: Unsubscribe[] = [];

  constructor(p: Props<T>, ...children: PossibleChild<C>[]) {
    p.txt && (p.textContent = p.txt);
    const node = document.createElement(p.tag ?? 'div') as T;
    Object.assign(node, p);
    if (p.style) {
      Object.entries(p.style)
        .filter((entry) => !!entry[1])
        .forEach((key, value) => {
          // @ts-expect-error - TS doesn't like the fact that we're using a string index to access the style object
          node.style[key] = value;
        });
    }
    if (children.length > 0) {
      this.appendChildren(children);
    }
    this._node = node;
  }

  public get node(): Readonly<T> {
    return this._node;
  }

  public append(child: NonNullable<PossibleChild<C>>): void {
    if (child instanceof BaseComponent) {
      this._node.append(child.node);
      this.children.push(child);
    } else {
      this._node.append(child);
    }
  }

  public appendChildren(possibleChildren: (PossibleChild<C> | null)[]): void {
    const children = possibleChildren.filter(isNotNullable);
    for (const child of children) {
      this.append(child);
    }
  }

  public setTextContent(text: string): void {
    this._node.textContent = text;
  }

  public addClass(className: string): void {
    this._node.classList.add(className);
  }

  public toggleClass(className: string, force?: boolean): void {
    this._node.classList.toggle(className, force);
  }

  public removeClass(className: string): void {
    this._node.classList.remove(className);
  }

  public destroyChildren(): void {
    for (const child of this.children) {
      child.destroy();
    }
  }

  public destroy(): void {
    this.destroyChildren();
    this._node.remove();
    this.unsubscribeAll();
  }

  public toString(): string {
    return this._node.outerHTML;
  }

  public subscribe(subscription: Unsubscribe): void {
    this.subscriptions.push(subscription);
  }

  public unsubscribeAll(): void {
    for (const unsubscribe of this.subscriptions) {
      unsubscribe();
    }
  }

  public on(event: string, callback: (e: Event) => void): void {
    this._node.addEventListener(event, callback);
  }

  public off(event: string, callback: (e: Event) => void): void {
    this._node.removeEventListener(event, callback);
  }

  public setAttribute(name: string, value: string): void {
    this._node.setAttribute(name, value);
  }

  public removeAttribute(name: string): void {
    this._node.removeAttribute(name);
  }
}

export function bc$<T extends HTMLElement = HTMLElement>(props: Props<T>, ...children: PossibleChild[]) {
  return new BaseComponent<T>(props, ...children);
}
