import { BaseComponent, h1, p } from '@control.ts/signals';

import styles from './about.module.scss';

export class AboutPageComponent extends BaseComponent {
  constructor(data?: { version: string }) {
    super(
      { className: styles.aboutPage },
      h1({ className: styles.title, txt: 'About Movie App' }),
      p({
        className: styles.description,
        txt: `Welcome to the Movie App! This is a simple application built to demonstrate the power of @control.ts framework. Current version from server: ${data?.version || 'unknown'}`,
      }),
    );
  }
}

export const AboutPage = (data?: { version: string }) => new AboutPageComponent(data);
