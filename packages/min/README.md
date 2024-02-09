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

## License

сontrol.ts is licensed under the MIT License.

## Contact

Have questions or need support? Feel free to reach out to us at [support](mailto:ikk.pott@gmail.com).

---
