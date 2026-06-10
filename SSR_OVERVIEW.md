# SSR in Control.ts

Control.ts supports Server-Side Rendering (SSR) out of the box across all of its packages. This guide provides a high-level overview of the SSR capabilities and how to get started.

## Package Overview

Control.ts has three packages with SSR support, each tailored for different use cases:

| Package                   | Purpose          | SSR Support                                  | Best For                                              |
| ------------------------- | ---------------- | -------------------------------------------- | ----------------------------------------------------- |
| **`@control.ts/control`** | Base Package     | ✅ Full support                              | Custom implementations, frameworks, low-level control |
| **`@control.ts/min`**     | Minimal Package  | ✅ Full support                              | Simple components, props-based functional creation    |
| **`@control.ts/signals`** | Reactive Package | ✅ Full support + Signal State Serialization | Complex state management, reactive components         |

For deep dives into each package's SSR capabilities, check out their specific guides:

- [Base Control SSR Guide](./packages/control/SSR_GUIDE.md)
- [Min Package SSR Guide](./packages/min/SSR_GUIDE.md)
- [Signals Package SSR Guide](./packages/signals/SSR_GUIDE.md)

## Quick Start Guide

This quick start will get you up and running with Server-Side Rendering using `@control.ts/signals` (the reactive package) as an example.

### 1. Installation

```bash
pnpm add @control.ts/signals @preact/signals-core
```

### 2. Create a Reactive Component

```typescript
// components/Counter.ts
import { BaseComponent } from '@control.ts/signals';
import { signal } from '@preact/signals-core';

export class Counter extends BaseComponent {
  private count = signal(0);

  constructor() {
    super({ tag: 'div', className: 'counter' });

    const display = new BaseComponent({
      tag: 'span',
      txt: `Count: ${this.count.value}`,
    });

    const button = new BaseComponent({
      tag: 'button',
      txt: 'Increment',
    });

    button.node.onclick = () => {
      this.count.value++;
      display.node.textContent = `Count: ${this.count.value}`;
    };

    this._appendChildren([display, button]);
  }

  getSignalState() {
    return { count: this.count.value };
  }
}
```

### 3. Server-Side Rendering

On your server (e.g. Express, Fastify), use `createSSRContext` and `renderToDocument`:

```typescript
// server.ts
import express from 'express';
import { createSSRContext, renderToDocument } from '@control.ts/signals/ssr';
import { Counter } from './components/Counter';

const app = express();

app.get('/', (req, res) => {
  createSSRContext();

  const counter = new Counter();

  const html = renderToDocument(counter, {
    title: 'Counter App',
    scripts: ['/client.js'],
  });

  res.send(html);
});

app.listen(3000);
```

### 4. Client-Side Hydration

On the client side, attach functionality and reactivity without re-rendering the DOM using `mountWithHydration`:

```typescript
// client.ts
import { mountWithHydration } from '@control.ts/signals/hydrate';
import { Counter } from './components/Counter';

const root = document.getElementById('root')!;
mountWithHydration(root, () => new Counter());
```

## Core SSR APIs

All three packages share the same consistent SSR APIs:

### Server-Side

```typescript
createSSRContext(); // Initialize SSR before rendering
renderToDocument(app, options); // Render full HTML string including DOCTYPE
renderComponentToString(app); // Render only the component HTML
clearSSRContext(); // Cleanup (usually automatic)
isServerEnvironment(); // Check if code is running on server
serializeHydrationData(); // Get hydration JSON manually
```

### Client-Side

```typescript
mountWithHydration(root, app); // Smart mount with auto-hydration
hydrateComponent(component); // Manual hydration
isHydrationAvailable(); // Check for SSR data
loadHydrationData(); // Get hydration metadata manually
```
