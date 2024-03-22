import type { Signalize } from '@control.ts/signals';
import { $$, button$, getValue$ } from '@control.ts/signals';

import styles from './button.module.scss';

interface Props {
  txt: string;
  onClick?: () => void;
  className?: Signalize<string>;
}

export const Button = ({ txt, onClick, className }: Props) =>
  button$({
    className: $$(() => `${styles.button} ${getValue$(className) || ''}`),
    txt,
    onclick: (e: Event) => {
      e.preventDefault();
      onClick?.();
    },
  });
