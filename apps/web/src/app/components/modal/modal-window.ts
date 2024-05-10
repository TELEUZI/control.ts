import { Button } from '@components/button/button';
import { BaseComponent, bcToFc, div, div$, h2 } from '@control.ts/signals';

import styles from './modal-window.module.scss';

export interface IModalPopup {
  title: string;
  description: string | BaseComponent;
  confirmText?: string;
  declineText?: string;
}

class ModalWindowComponent extends BaseComponent {
  private resolve?: (value: boolean) => void;
  private modalWrapper: HTMLDivElement;

  constructor(config: IModalPopup) {
    super({ className: 'modal' });
    this.modalWrapper = div({ className: 'grey-modal', onclick: this.onOutsideClick });
    this.appendChildren([
      this.modalWrapper,
      div$(
        {
          className: styles.content,
        },
        div(
          { className: styles.header },
          h2({
            txt: config.title,
          }),
        ),
        config.description instanceof BaseComponent
          ? config.description
          : div({ className: styles.body, txt: config.description }),
        div$(
          {
            className: styles.footer,
          },
          Button({
            txt: config.confirmText ?? 'OK',
            onClick: () => {
              this.setResult(true);
            },
          }),
          config.declineText != null
            ? Button({
                txt: config.declineText,
                onClick: () => {
                  this.setResult(false);
                },
              })
            : null,
        ),
      ),
    ]);
  }

  public open(parent: BaseComponent | HTMLElement = document.body): Promise<boolean> {
    parent.append(this.node);
    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  private setResult(result: boolean): void {
    this.resolve?.(result);
    this.destroy();
  }

  private readonly onOutsideClick = (event: Event) => {
    if (event.target === this.modalWrapper) {
      this.setResult(false);
    }
  };
}

export const ModalWindow = bcToFc(ModalWindowComponent);
