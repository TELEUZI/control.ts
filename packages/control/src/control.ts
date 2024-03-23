export type Unsubscribe = () => void;

export type PossibleChild<C extends HTMLElement, Component> = C | Component | null;

export type ComponentProps<T extends HTMLElement = HTMLElement> = Props<T>;

export type ComponentChild<T extends HTMLElement = HTMLElement, Component extends Control = Control> = PossibleChild<
  T,
  Component
>;

export type Props<T extends HTMLElement = HTMLElement> = Partial<
  Omit<T, 'style' | 'classList' | 'children' | 'tagName'>
> & {
  txt?: string;
  tag?: keyof HTMLElementTagNameMap;
  style?: Partial<CSSStyleDeclaration>;
};

export abstract class Control<T extends HTMLElement = HTMLElement> {
  protected abstract _node: T;

  protected abstract children: Control[];

  public subscriptions: Unsubscribe[] = [];

  public get node(): T {
    return this._node;
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
    this.children = [];
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
    this.subscriptions = [];
  }

  public appendTo(parent: HTMLElement): void {
    parent.append(this._node);
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

  protected applyStyle<K extends Partial<CSSStyleDeclaration>>(style: K): void {
    for (const key in style) {
      this._node.style[key] = style[key] || '';
    }
  }

  public removeChild(child: Control): void {
    this._node.removeChild(child.node);
    this.removeFromChildren(child);
  }

  protected removeFromChildren(child: Control): void {
    this.children = this.children.filter((c) => c !== child);
  }
}
