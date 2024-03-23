import { BaseComponent } from '@control.ts/min/base-component';

import styles from './button.module.scss';

export interface ButtonProps {
  /**
   * Is this the principal call to action on the page?
   */
  primary?: boolean;
  /**
   * What background color to use
   */
  backgroundColor?: string;
  /**
   * How large should the button be?
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Button contents
   */
  label: string;
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

/**
 * Primary UI component for user interaction
 */
export const Button = ({ primary = false, size = 'medium', backgroundColor, label, onClick }: ButtonProps) => {
  return new BaseComponent<HTMLButtonElement>({
    tag: 'button',
    className: `${styles.button} ${styles[size]} ${styles[primary ? 'primary' : 'secondary']}`,
    txt: label,
    style: { backgroundColor },
    onclick: (e: Event) => {
      e.preventDefault();
      onClick?.();
    },
  });
};
