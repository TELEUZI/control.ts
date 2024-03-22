import { div$ } from '@control.ts/signals';

import styles from './img.module.scss';

export const ImageWithPlaceholder = ({ src = '', alt = '', className = '' }) => {
  const image = new Image();
  const wrapper = div$(
    {
      className: styles.placeholder,
    },
    image,
  );
  image.src = src;
  image.alt = alt;
  image.className = className;
  image.onload = () => {
    wrapper.removeClass(styles.placeholder);
  };
  return wrapper;
};
