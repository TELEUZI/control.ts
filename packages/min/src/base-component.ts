import { BaseComponent as CoreBaseComponent } from '@control.ts/control';

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
  Component extends CoreBaseComponent = CoreBaseComponent,
> = PossibleChild<T, Component>;

export type ComponentProps<T extends HTMLElement = HTMLElement> = Props<T>;
export type BaseComponentProps<T extends HTMLElement = HTMLElement> = ComponentProps<T>;
export type BaseComponentChild<T extends HTMLElement = HTMLElement> = ComponentChild<T, BaseComponent>;

export class BaseComponent<T extends HTMLElement = HTMLElement> extends CoreBaseComponent<
  T,
  ComponentProps<T>,
  BaseComponentChild<HTMLElement>
> {}
