import { Control, isNotNullable } from '@control.ts/control';
export type Props<T extends HTMLElement = HTMLElement> = Partial<
  Omit<T, 'style' | 'classList' | 'children' | 'tagName'>
> & {
  txt?: string;
  tag?: keyof HTMLElementTagNameMap;
  style?: Partial<CSSStyleDeclaration>;
};

export type PossibleChild<C extends HTMLElement, Component> = C | Component | null;

export type ComponentChild<
  T extends HTMLElement = HTMLElement,
  Component extends BaseComponent = BaseComponent,
> = PossibleChild<T, Component>;

export type ComponentProps<T extends HTMLElement = HTMLElement> = Props<T>;
export type BaseComponentProps<T extends HTMLElement = HTMLElement> = ComponentProps<T>;
export type BaseComponentChild<T extends HTMLElement = HTMLElement> = ComponentChild<T, BaseComponent>;

export class BaseComponent<T extends HTMLElement = HTMLElement> extends Control<T> {
  protected _node: T;

  public children: BaseComponent[] = [];
  public parent: BaseComponent | null = null;

  constructor(p: ComponentProps<T>, ...children: BaseComponentChild[]) {
    super();
    if (p.txt) {
      p.textContent = p.txt;
    }
    const node = document.createElement(p.tag ?? 'div') as T;
    this._node = Object.assign(node, p);
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
      child.parent = this;
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

  public replaceWith(child: BaseComponent | HTMLElement | Comment): void {
    this._node.replaceWith(child instanceof BaseComponent ? child.node : child);
  }

  public remove(): void {
    if (this.parent) {
      this.parent.removeChild(this);
    }
    this._node.remove();
    this.parent = null;
  }

  public override removeChild(child: BaseComponent): void {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
      child.parent = null;
      child.node.remove();
    }
  }

  public moveTo(newParent: BaseComponent, index?: number): void {
    if (this.parent) {
      const oldIndex = this.parent.children.indexOf(this);
      if (oldIndex > -1) {
        this.parent.children.splice(oldIndex, 1);
      }
    }
    this._node.remove();

    if (index !== undefined && index < newParent.children.length) {
      const referenceNode = newParent.children[index]?.node;
      if (!referenceNode) {
        throw new Error('Reference node not found');
      }
      newParent._node.insertBefore(this._node, referenceNode);
      newParent.children.splice(index, 0, this);
    } else {
      newParent._node.append(this._node);
      newParent.children.push(this);
    }
    this.parent = newParent;
  }

  public insertBefore(child: BaseComponent, reference: BaseComponent | null): void {
    if (!(child instanceof BaseComponent)) {
      throw new Error('Child is not a BaseComponent');
    }
    if (reference) {
      const index = this.children.indexOf(reference);
      if (index > -1) {
        this._node.insertBefore(child.node, reference.node);
        this.children.splice(index, 0, child);
        child.parent = this;
      }
    } else {
      this.append(child);
    }
  }
}
