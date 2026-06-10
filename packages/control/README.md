# control.ts - Control your code with ease

**control.ts** is a lightweight (<1kb) and versatile UI library for building modern web applications with ease. With its intuitive syntax and powerful features, сontrol.ts simplifies the process of creating dynamic user interfaces.

## Features

- **Easy-to-Use API:** сontrol.ts provides a familiar interface, with classes and functions named after HTML elements, making it simple to create and manipulate UI components.

- **Modular Design:** Each component is designed to be modular, allowing for easy customization and integration into existing projects.

- **TypeScript Support:** Built with TypeScript, сontrol.ts offers type safety and enhanced code readability, making it a great choice for large-scale projects.

- **Server-Side Rendering (SSR):** Built-in SSR support with automatic hydration for improved performance, SEO, and user experience. [Learn more](./SSR_GUIDE.md)

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

## Server-Side Rendering (SSR)

сontrol.ts now supports SSR out of the box! Improve your app's performance, SEO, and user experience.

### Quick Example

**Server:**

```typescript
import { createSSRContext, renderToDocument } from '@control.ts/control';
import { App } from './app';

const html = renderToDocument(new App(), {
  title: 'My App',
  scripts: [{ src: '/client.js', type: 'module' }],
});

// Send HTML to client
response.send(html);
```

**Client:**

```typescript
import { mountWithHydration } from '@control.ts/control';
import { App } from './app';

// Automatically hydrates server-rendered content
mountWithHydration(document.getElementById('app')!, () => new App());
```

### Benefits

- ✅ **Better SEO** - Search engines can crawl your content
- ✅ **Faster First Paint** - Users see content immediately
- ✅ **Progressive Enhancement** - Works even without JavaScript
- ✅ **Improved Performance** - Reduced time to interactive

[Read the complete SSR Guide →](./SSR_GUIDE.md)

## License

сontrol.ts is licensed under the MIT License.

## Contact

Have questions or need support? Feel free to reach out to us at [support](mailto:ikk.pott@gmail.com).

---
