import rsSchoolLogo from '@assets/rs_school.svg';
import { a, div, h2, header, img } from '@control.ts/signals';

import { Link } from '../link/link.js';
import styles from './header.module.scss';

export const Header = () => {
  return header(
    { className: styles.header },
    Link(
      { href: '/movie-app/', className: styles.link },
      h2({
        className: styles.title,
        textContent: 'Movie app',
      }),
    ),
    div(
      { style: { display: 'flex', gap: '1rem', marginLeft: '2rem' } },
      Link({ href: '/movie-app/', textContent: 'Home', style: { color: '#fff', textDecoration: 'none' } }),
      Link({ href: '/movie-app/about', textContent: 'About', style: { color: '#fff', textDecoration: 'none' } }),
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
