import { Control, type PossibleChild, type Props } from './control';
import { isNotNullable } from './utils';

export type AnyBaseComponent = BaseComponent<HTMLElement, Record<string, unknown>, unknown>;

export class BaseComponent<
  T extends HTMLElement = HTMLElement,
  P extends { tag?: keyof HTMLElementTagNameMap; txt?: unknown; style?: unknown } & Record<string, unknown> = Props<T>,
  C = PossibleChild<T, AnyBaseComponent>,
> extends Control<T> {
  protected _node: T;

  public children: AnyBaseComponent[] = [];
  public parent: AnyBaseComponent | null = null;

  constructor(p: P, ...children: C[]) {
    super();
    this._node = document.createElement(p.tag ?? 'div') as T;
    this.applyProps(p);
    if (children.length > 0) {
      this.appendChildren(children);
    }
  }

  protected applyProps(p: P): void {
    if (p.txt && typeof p.txt === 'string') {
      this._node.textContent = p.txt;
    }
    Object.assign(this._node, p);
    if (p.style && typeof p.style === 'object') {
      this.applyStyle(p.style as Partial<CSSStyleDeclaration>);
    }
  }

  public append(child: NonNullable<C>): void {
    if (child instanceof BaseComponent) {
      this._node.append(child.node);
      this.children.push(child);
      child.parent = this;
    } else if (child instanceof HTMLElement) {
      this._node.append(child);
    }
  }

  public appendChildren(possibleChildren: (C | null)[]): void {
    const children = possibleChildren.filter(isNotNullable);
    for (const child of children) {
      this.append(child);
    }
  }

  public replaceWith(child: AnyBaseComponent | HTMLElement | Comment): void {
    this._node.replaceWith(child instanceof BaseComponent ? child.node : child);
  }

  public remove(): void {
    if (this.parent) {
      this.parent.removeChild(this);
    }
    this._node.remove();
    this.parent = null;
  }

  public override removeChild(child: AnyBaseComponent): void {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
      child.parent = null;
      child.node.remove();
    }
  }

  public moveTo(newParent: AnyBaseComponent, index?: number): void {
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

  public insertBefore(child: AnyBaseComponent, reference: AnyBaseComponent | null): void {
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
      this.append(child as unknown as NonNullable<C>);
    }
  }
}
