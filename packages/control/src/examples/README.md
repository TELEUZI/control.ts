# SSR Examples

This directory contains examples demonstrating Server-Side Rendering with Control.ts.

## Files

- **`simple-ssr-demo.ts`** - Basic SSR examples you can run with Node.js
- **`ssr-server.example.ts`** - Complete server setup examples (Express, Fastify)
- **`ssr-client.example.ts`** - Client-side hydration examples

## Running the Simple Demo

You can run the simple demo to see SSR output:

```bash
# If using ts-node
npx ts-node src/examples/simple-ssr-demo.ts

# Or compile and run
npx tsc src/examples/simple-ssr-demo.ts --outDir dist/examples
node dist/examples/simple-ssr-demo.js
```

## Demo Descriptions

### Demo 1: Component to String

Shows how to render a single component to an HTML string.

### Demo 2: Full HTML Document

Demonstrates rendering a complete HTML document with meta tags, scripts, and styles.

### Demo 3: Multiple Components

Shows nested components with parent-child relationships.

### Demo 4: Dynamic Content

Simulates server-side data fetching and rendering user-specific content.

## Integration Examples

### Express.js Server

```typescript
import express from 'express';
import { createSSRContext, renderToDocument } from '@control.ts/control';
import { App } from './app';

const server = express();

server.get('/', (req, res) => {
  const html = renderToDocument(new App(), {
    title: 'My App',
    scripts: [{ src: '/client.js', type: 'module' }],
  });
  res.send(html);
});

server.listen(3000);
```

### Fastify Server

```typescript
import Fastify from 'fastify';
import { renderToDocument } from '@control.ts/control';
import { App } from './app';

const fastify = Fastify();

fastify.get('/', async (request, reply) => {
  const html = renderToDocument(new App(), {
    title: 'My App',
  });
  reply.type('text/html').send(html);
});

fastify.listen({ port: 3000 });
```

### Vite SSR Plugin

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    ssr: true,
    rollupOptions: {
      input: {
        server: './src/server.ts',
        client: './src/client.ts',
      },
    },
  },
});
```

## Client-Side Hydration

Basic hydration setup:

```typescript
import { mountWithHydration } from '@control.ts/control';
import { App } from './app';

// Automatically detects and hydrates server-rendered content
const root = document.getElementById('app')!;
mountWithHydration(root, () => new App());
```

## Best Practices

1. **Always check environment** before using browser APIs:

   ```typescript
   if (typeof document !== 'undefined') {
     // Browser-only code
   }
   ```

2. **Use universal factories** for cross-platform components:

   ```typescript
   import { createElementFactoryUniversal } from '@control.ts/control';
   const div = createElementFactoryUniversal('div');
   ```

3. **Handle data fetching properly**:

   ```typescript
   // Server
   const data = await fetchData();
   const app = new App(data);

   // Client - hydrate with same data
   const data = window.__INITIAL_STATE__;
   mountWithHydration(root, () => new App(data));
   ```

4. **Minimize hydration mismatches**:
   - Avoid timestamps or random values
   - Ensure server and client render identically
   - Use `process.env.NODE_ENV` checks when needed

## Troubleshooting

### "document is not defined"

Make sure you're checking the environment:

```typescript
if (typeof document !== 'undefined') {
  // Use document here
}
```

### Hydration Warnings

Check that server and client HTML match exactly. Use consistent data between renders.

### Event Handlers Not Working

Ensure handlers are attached during component construction, not in lifecycle methods that don't run on server.

## Next Steps

1. Read the full [SSR Guide](../SSR_GUIDE.md)
2. Check out the [Control.ts Documentation](../../README.md)
3. Explore advanced patterns in the main examples

## Support

- GitHub: https://github.com/TELEUZI/control.ts
- Issues: https://github.com/TELEUZI/control.ts/issues
