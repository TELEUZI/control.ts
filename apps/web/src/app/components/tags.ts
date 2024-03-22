import type { SignalProps } from '@control.ts/signals';
import { BaseComponent } from '@control.ts/signals';

export const iconFromCode = (props: SignalProps, code: string) =>
  new BaseComponent({ ...props, tag: 'i', innerHTML: code });
