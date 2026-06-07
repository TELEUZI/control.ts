import { createElementFactoryFabric } from '@control.ts/control';

import type { BaseComponentChild, BaseComponentProps } from './base-component';
import { BaseComponent } from './base-component';

export type { ElementFnProps, TagName } from '@control.ts/control';
export { createElement, createElementFactory, createElementFactoryWithCustomProps } from '@control.ts/control';

export const createElementFactory$ = createElementFactoryFabric<
  BaseComponentProps<HTMLElement>,
  BaseComponentChild<HTMLElement>,
  BaseComponent<HTMLElement>
>(BaseComponent);
