import { BaseComponent } from '@control.ts/min';

import styles from './label.module.scss';

interface LabelProps {
  className?: string;
}

export const Label = (props: LabelProps) =>
  new BaseComponent<HTMLLabelElement>({
    tag: 'label',
    className: `${props.className} ${styles.label}`,
  });
