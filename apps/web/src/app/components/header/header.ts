import rsSchoolLogo from '@assets/rs_school.svg';
import { a, div, h2, header, img } from '@control.ts/signals';

import styles from './header.module.scss';

export const Header = () => {
  return header(
    { className: styles.header },
    a(
      { href: '/movie-app/', className: styles.link },
      h2({
        className: styles.title,
        textContent: 'Movie app',
      }),
    ),
    div(
      {
        className: styles.logo,
      },
      a(
        { href: 'https://rs.school/js/', target: '_blank' },
        img({
          src: rsSchoolLogo,
          alt: 'rs-school-logo',
        }),
      ),
    ),
  );
};
