# control.ts - Control your code with ease

**control.ts** is a lightweight (<1kb) and versatile UI library for building modern web applications with ease. With its intuitive syntax and powerful features, сontrol.ts simplifies the process of creating dynamic user interfaces.

## Features

- **Easy-to-Use API:** сontrol.ts provides a familiar interface, with classes and functions named after HTML elements, making it simple to create and manipulate UI components.

- **Modular Design:** Each component is designed to be modular, allowing for easy customization and integration into existing projects.

- **TypeScript Support:** Built with TypeScript, сontrol.ts offers type safety and enhanced code readability, making it a great choice for large-scale projects.

## Installation

To install control.ts, simply run:

```bash
npm install @control.ts/min

// or

pnpm add @control.ts/min

// or

yarn add @control.ts/min
```

## Getting Started

Using сontrol.ts is straightforward. Here's a basic example of creating a menu with links:

```typescript
import { nav, ul, li, a, mount } from '@control.ts/min';

const links = [
  { href: '/', text: 'Home' },
  { href: '/about', text: 'About' },
  { href: '/contact', text: 'Contact' },
];

const menu = nav(
  {
    className: 'nav-menu',
  },
  ul(
    { className: 'menu' },
    ...links.map((link) => li({ className: 'menu-item' }, a({ href: link.href, txt: link.text }))),
  ),
);

const app = document.getElementById('app');
mount(app!, menu);
```

## Preact Signals Integration

`control.ts` also seamlessly integrates with [Preact Signals](https://github.com/preactjs/signals) in `@control.ts/signals` standalone package, allowing for efficient handling of UI events and state management.

The provided TypeScript code snippet demonstrates the implementation of a button component using `control.ts` and signals. The component utilizes signals for dynamic behavior and styling, providing a reactive and modular approach to building UI elements.

```typescript
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
```

In this example:

- The `Button` component is defined, accepting props such as text (`txt`), an optional click event handler (`onClick`), and a dynamic class name (`className`).
- The `className` is defined as a `Signalize<string>`, indicating that it can be a `Signal` with `string` value.
- Inside the `Button` component, the `button$` function from `control.ts` is used to create a button element. It is a wrapper of the `BaseComponent` with `button` tagName.
- The `className` for the button is computed dynamically using `$$`, a computed signal that combines styles from the css module with any additional classes provided through the className prop.
- The `getValue$` retrieves the current value from a signal or a non-signal input and ensures that the latest value is obtained.

## License

сontrol.ts is licensed under the MIT License.

## Contact

Have questions or need support? Feel free to reach out to us at [support](mailto:ikk.pott@gmail.com).

---
