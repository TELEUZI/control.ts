import { isNotNullable } from './utils/is-nullable';

export type Props<T extends HTMLElement = HTMLElement> = Partial<
  Omit<T, 'style' | 'dataset' | 'classList' | 'children' | 'tagName'>
> & {
  txt?: string;
  tag?: keyof HTMLElementTagNameMap;
};

export type PossibleChild = HTMLElement | BaseComponent | null;

export class BaseComponent<T extends HTMLElement = HTMLElement> {
  protected _node: T;

  protected children: BaseComponent[] = [];

  constructor(p: Props<T>, ...children: PossibleChild[]) {
    p.txt && (p.textContent = p.txt);
    const node = document.createElement(p.tag ?? 'div') as T;
    Object.assign(node, p);
    this._node = node;
    if (children) {
      this.appendChildren(children.filter(isNotNullable));
    }
  }

  public get node(): Readonly<T> {
    return this._node;
  }

  public append(child: NonNullable<PossibleChild>): void {
    if (child instanceof BaseComponent) {
      this.children.push(child);
      this.node.append(child.node);
    } else {
      this.node.append(child);
    }
  }

  public appendChildren(children: PossibleChild[]): void {
    children.filter(isNotNullable).forEach((el) => {
      this.append(el);
    });
  }

  public setTextContent(text: string): void {
    this._node.textContent = text;
  }

  public addClass(className: string): void {
    this.node.classList.add(className);
  }

  public toggleClass(className: string): void {
    this.node.classList.toggle(className);
  }

  public removeClass(className: string): void {
    this.node.classList.remove(className);
  }

  public destroyChildren(): void {
    this.children.forEach((child) => {
      child.destroy();
    });
    this.children.length = 0;
  }

  public destroy(): void {
    this.destroyChildren();
    this.node.remove();
  }

  public toString(): string {
    return this.node.outerHTML;
  }
}

export function bc$<T extends HTMLElement = HTMLElement>(props: Props<T>, ...children: PossibleChild[]) {
  return new BaseComponent<T>(props, ...children);
}
