import type { Signal } from '@control.ts/signals';
import { $$, BaseComponent, div$ } from '@control.ts/signals';

import styles from './loader.module.scss';

class LoaderComponent extends BaseComponent {
  constructor(public isLoading: Signal<boolean>) {
    super({ className: $$(() => (isLoading.value ? 'grey-modal' : '')) });
    this.append(
      div$({
        className: $$(() => (isLoading.value ? styles.loader : '')),
      }),
    );
  }

  public show(): void {
    this.isLoading.value = true;
  }

  public hide(): void {
    this.isLoading.value = false;
  }
}

export const Loader = (isLoading: Signal<boolean>) => new LoaderComponent(isLoading);
