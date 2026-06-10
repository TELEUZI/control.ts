import { div$, img } from '@control.ts/signals';

import styles from './img.module.scss';

export const ImageWithPlaceholder = ({ src = '', alt = '', className = '' }) => {
  const image = img({ src, alt, className });
  const wrapper = div$(
    {
      className: styles.placeholder,
    },
    image,
  );

  image.onload = () => {
    wrapper.removeClass(styles.placeholder);
  };
  return wrapper;
};
