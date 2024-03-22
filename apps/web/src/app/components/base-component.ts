import { BaseComponent as Control } from '@control.ts/signals';

export class BaseComponent<T extends HTMLElement = HTMLElement> extends Control<T> {
  public setStyle(style: Partial<CSSStyleDeclaration>) {
    this.applyStyle(style);
  }
}
