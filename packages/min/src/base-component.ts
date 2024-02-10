import { isNotNullable } from './utils/is-nullable';

export type Props<T extends HTMLElement = HTMLElement> = Partial<
  Omit<T, 'style' | 'classList' | 'children' | 'tagName'>
> & {
  txt?: string;
  tag?: keyof HTMLElementTagNameMap;
  style?: Partial<CSSStyleDeclaration>;
};

export type PossibleChild = HTMLElement | BaseComponent | null;

export class BaseComponent<T extends HTMLElement = HTMLElement> {
  protected _node: T;

  public children: BaseComponent[] = [];

  constructor(p: Props<T>, ...children: PossibleChild[]) {
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
