import { isNotNullable } from './utils/is-nullable';

export type Props<T extends HTMLElement = HTMLElement> = Partial<
  Omit<T, 'style' | 'dataset' | 'classList' | 'children' | 'tagName'>
> & {
  txt?: string;
  tag?: keyof HTMLElementTagNameMap;
};

export type ElementFnProps<T extends HTMLElement = HTMLElement> = Omit<Props<T>, 'tag'>;

type TagName = keyof HTMLElementTagNameMap;

type PossibleChild = HTMLElement | BaseComponent | null;

export function createElement<T extends TagName>(tag: T, props: ElementFnProps, ...children: HTMLElement[]) {
  const node = document.createElement(tag);
  Object.assign(node, props);
  children.forEach((child) => node.append(child));
  return node;
}

export function createElementFactory<T extends TagName>(tag: T) {
  return (props: ElementFnProps, ...children: HTMLElement[]) => createElement(tag, props, ...children);
}

export function createElementFactoryWithCustomProps<T extends TagName, P extends Partial<ElementFnProps>>(
  tag: T,
  props: P,
) {
  return (customProps: Partial<P>, ...children: HTMLElement[]) =>
    createElement<T>(tag, { ...props, ...customProps }, ...children);
}

export function createElement$<T extends TagName>(
  props: Props<HTMLElementTagNameMap[T]> & { tag: T },
  children?: PossibleChild[],
) {
  return new BaseComponent<HTMLElementTagNameMap[T]>(props, ...(children ?? []));
}

export function createElementFactory$<T extends TagName>(tag: T) {
  return (props: Props<HTMLElementTagNameMap[T]>, ...children: PossibleChild[]) =>
    createElement$({ tag, ...props }, children);
}

export class BaseComponent<T extends HTMLElement = HTMLElement> {
  protected node: T;

  protected children: BaseComponent[] = [];

  constructor(p: Props<T>, ...children: PossibleChild[]) {
    p.txt && (p.textContent = p.txt);
    const node = document.createElement(p.tag ?? 'div') as T;
    Object.assign(node, p);
    this.node = node;
    if (children) {
      this.appendChildren(children.filter(isNotNullable));
    }
  }

  public append(child: NonNullable<PossibleChild>): void {
    if (child instanceof BaseComponent) {
      this.children.push(child);
      this.node.append(child.getNode());
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
    this.node.textContent = text;
  }

  public getNode() {
    return this.node;
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
    let html = `<${this.node.tagName.toLowerCase()} class="${Array.from(this.node.classList).join(' ')}">`;

    if (this.node.textContent) {
      html += this.node.textContent;
    }

    this.children.forEach((child) => {
      html += child.toString();
    });

    html += `</${this.node.tagName.toLowerCase()}>`;

    return html;
  }
}
