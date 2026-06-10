# Server-Side Rendering (SSR) Guide for Control.ts

This guide explains how to add SSR support to your Control.ts applications.

## Table of Contents

1. [Overview](#overview)
2. [Why SSR?](#why-ssr)
3. [Architecture](#architecture)
4. [Quick Start](#quick-start)
5. [API Reference](#api-reference)
6. [Advanced Usage](#advanced-usage)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Migration Guide](#migration-guide)
10. [Testing Hydration](#testing-hydration)
11. [Quick Reference](#quick-reference)
12. [Examples & Support](#examples--support)

## Overview

Control.ts now supports Server-Side Rendering (SSR) out of the box. SSR allows you to:

- **Improve SEO**: Search engines can crawl your fully-rendered HTML
- **Faster First Paint**: Users see content before JavaScript loads
- **Better Performance**: Reduced time to interactive on slow connections
- **Progressive Enhancement**: Content works even if JavaScript fails

## Why SSR?

### Traditional CSR (Client-Side Rendering)

```
Server → HTML Shell → Browser Downloads JS → JS Executes → Content Rendered
```

### With SSR

```
Server → Fully Rendered HTML → Browser Shows Content → JS Hydrates → Interactive
```

## Architecture

The SSR implementation consists of three main parts:

### 1. **Server-Side Rendering** (`ssr.ts`)

- Renders components to HTML strings
- Tracks component hierarchy
- Generates hydration data

### 2. **Client-Side Hydration** (`hydrate.ts`)

- Attaches event listeners to server-rendered HTML
- Reuses existing DOM instead of recreating it
- Validates server/client HTML match (dev mode)

### 3. **Universal Factories** (`factories-ssr.ts`)

- Element factories that work in both Node.js and browser
- Virtual DOM support for complex scenarios
- JSX-ready (for future implementations)

## Quick Start

### Step 1: Server Setup

Create a server file (e.g., `server.ts`):

```typescript
import express from 'express';
import { createSSRContext, renderToDocument } from '@control.ts/control';
import { App } from './app';

const server = express();

server.use(express.static('public'));

server.get('*', (req, res) => {
  // Initialize SSR context
  createSSRContext();

  // Create your app
  const app = new App();

  // Render to HTML
  const html = renderToDocument(app, {
    title: 'My Control.ts App',
    scripts: [{ src: '/client.js', type: 'module' }],
    links: [{ rel: 'stylesheet', href: '/styles.css' }],
  });

  res.send(html);
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### Step 2: Update Your Component

Make your component work in both environments:

```typescript
import { Control } from '@control.ts/control';

export class App extends Control<HTMLDivElement> {
  protected _node: HTMLDivElement;
  protected childComponents: Control[] = [];

  constructor() {
    super();

    // Check environment
    if (typeof document !== 'undefined') {
      this._node = document.createElement('div');
      this._node.className = 'app';
      this.render();
    } else {
      // SSR mode - minimal setup
      this._node = { className: 'app' } as any;
    }
  }

  private render(): void {
    const title = document.createElement('h1');
    title.textContent = 'Hello SSR!';

    const button = document.createElement('button');
    button.textContent = 'Click Me';
    button.onclick = () => alert('Hydrated!');

    this._node.append(title, button);
  }
}
```

### Step 3: Client Hydration

Create a client entry file (e.g., `client.ts`):

```typescript
import { mountWithHydration } from '@control.ts/control';
import { App } from './app';

const root = document.getElementById('app')!;
mountWithHydration(root, () => new App());
```

### Step 4: Build Configuration

Update your build to create separate bundles:

```javascript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        server: 'src/server.ts',
        client: 'src/client.ts',
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});
```

## API Reference

### Server-Side APIs

#### `createSSRContext()`

Initialize SSR context before rendering.

```typescript
import { createSSRContext } from '@control.ts/control';

createSSRContext();
```

#### `renderToDocument(app, options)`

Render complete HTML document with hydration data.

```typescript
const html = renderToDocument(app, {
  title: 'My App',
  meta: [{ name: 'description', content: 'My awesome app' }],
  links: [{ rel: 'stylesheet', href: '/styles.css' }],
  scripts: [{ src: '/client.js', type: 'module' }],
  lang: 'en',
  bodyAttrs: { 'data-theme': 'dark' },
});
```

#### `renderControlToString(component)`

Render just the component HTML (without document wrapper).

```typescript
const html = renderControlToString(app);
```

#### `clearSSRContext()`

Clear SSR context after rendering (automatically called by `renderToDocument`).

```typescript
clearSSRContext();
```

### Client-Side APIs

#### `mountWithHydration(root, app)`

Automatically detect and hydrate server-rendered content.

```typescript
import { mountWithHydration } from '@control.ts/control';

mountWithHydration(document.getElementById('app')!, () => new App());
```

#### `hydrate(rootElement, app)`

Manually hydrate a specific component.

```typescript
import { hydrate } from '@control.ts/control';

const app = new App();
const root = document.getElementById('app')!;
hydrate(root, app);
```

#### `isHydrationAvailable()`

Check if hydration data exists.

```typescript
import { isHydrationAvailable } from '@control.ts/control';

if (isHydrationAvailable()) {
  console.log('Server-rendered content detected');
}
```

### Universal Factories

#### `createElementFactoryUniversal(tag)`

Create element factories that work in both Node.js and browser.

```typescript
import { createElementFactoryUniversal } from '@control.ts/control';

const div = createElementFactoryUniversal('div');
const button = createElementFactoryUniversal('button');

// Works on server
const element = div({ className: 'container' }, button({ onclick: () => alert('hi') }, 'Click'));
```

#### Virtual DOM Functions

```typescript
import { h, renderVNode } from '@control.ts/control';

// Create virtual nodes
const vnode = h('div', { className: 'app' }, h('h1', null, 'Title'), h('p', null, 'Content'));

// Render to string (server)
const html = renderVNode(vnode);

// Convert to DOM (client)
const element = vNodeToElement(vnode);
```

## Advanced Usage

### Streaming SSR (Future Feature)

```typescript
import { renderToStream } from '@control.ts/control';

server.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');

  renderToStream(app, {
    push: (chunk) => res.write(chunk),
    end: () => res.end(),
  });
});
```

### Data Fetching with SSR

```typescript
export class App extends Control<HTMLDivElement> {
  private data: any = null;

  async fetchData(): Promise<void> {
    // Fetch data on server
    if (typeof window === 'undefined') {
      this.data = await fetch('https://api.example.com/data').then((r) => r.json());
    }
  }

  async init(): Promise<void> {
    await this.fetchData();
    this.render();
  }
}

// Server
const app = new App();
await app.init();
const html = renderToDocument(app);
```

### Serializing State

```typescript
// Server
const initialState = { user: { name: 'John' }, count: 42 };

const html = renderToDocument(app, {
  scripts: [
    {
      content: `window.__INITIAL_STATE__ = ${JSON.stringify(initialState)}`,
      type: 'text/javascript',
    },
    { src: '/client.js', type: 'module' },
  ],
});

// Client
const initialState = (window as any).__INITIAL_STATE__;
const app = new App(initialState);
mountWithHydration(root, app);
```

### Route-Based SSR

```typescript
// Server
server.get('*', (req, res) => {
  const url = req.url;
  const app = createAppForRoute(url);
  const html = renderToDocument(app, {
    title: getTitleForRoute(url),
  });
  res.send(html);
});

function createAppForRoute(url: string): Control {
  switch (url) {
    case '/':
      return new HomePage();
    case '/about':
      return new AboutPage();
    default:
      return new NotFoundPage();
  }
}
```

## Best Practices

### 1. **Environment Detection**

Always check the environment before using DOM APIs:

```typescript
if (typeof document !== 'undefined') {
  // Browser-only code
}

if (typeof window === 'undefined') {
  // Server-only code
}
```

### 2. **Avoid Side Effects in Constructors**

```typescript
// ❌ Bad
class MyComponent extends Control {
  constructor() {
    super();
    // This fails on server
    window.addEventListener('resize', this.handleResize);
  }
}

// ✅ Good
class MyComponent extends Control {
  constructor() {
    super();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize);
    }
  }
}
```

### 3. **Lazy Load Non-Critical Code**

```typescript
// Only load on client
if (typeof window !== 'undefined') {
  import('./analytics').then((analytics) => {
    analytics.init();
  });
}
```

### 4. **Minimize Hydration Mismatches**

Ensure server and client render the same HTML:

```typescript
// ❌ Bad - different on server/client
const time = new Date().toLocaleString();

// ✅ Good - consistent timestamp
const time = props.serverTime || new Date().toLocaleString();
```

### 5. **Progressive Enhancement**

Make your app work without JavaScript:

```typescript
// Forms should work without JS
<form action="/api/submit" method="POST">
  <input name="email" required />
  <button type="submit">Submit</button>
</form>
```

## Troubleshooting

### Hydration Mismatch Errors

**Problem**: Console warnings about mismatched HTML

**Solution**: Ensure server and client render identically

- Check for dynamic dates/times
- Verify random values are seeded
- Look for environment-specific code

### Memory Leaks

**Problem**: Server memory grows over time

**Solution**: Always clear SSR context

```typescript
const html = renderToDocument(app);
clearSSRContext(); // Automatic in renderToDocument
```

### Event Handlers Not Working

**Problem**: Click handlers don't fire after hydration

**Solution**: Ensure event handlers are registered during component construction:

```typescript
// ✅ Good - handlers attached in constructor/render
class MyComponent extends Control {
  render() {
    const btn = document.createElement('button');
    btn.onclick = () => alert('works!');
    this._node.append(btn);
  }
}
```

### Build Errors

**Problem**: `document is not defined` on server

**Solution**: Use environment checks or universal factories:

```typescript
import { createElementFactoryUniversal } from '@control.ts/control';
const div = createElementFactoryUniversal('div');
```

## Performance Tips

1. **Cache Rendered HTML**: Cache frequently accessed pages
2. **Minimize Hydration Data**: Only serialize necessary state
3. **Code Splitting**: Split client bundle by route
4. **Stream Rendering**: Use streaming for large pages (when available)
5. **Lazy Hydration**: Hydrate components as they enter viewport

## Migration Guide

This guide will help you migrate your existing Control.ts application to use Server-Side Rendering (SSR).

## Prerequisites

- Existing Control.ts application
- Node.js environment for server-side code
- Basic understanding of SSR concepts

## Step-by-Step Migration

### Step 1: Update Dependencies

First, ensure you have the latest version of `@control.ts/control`:

```bash
npm install @control.ts/control@latest
## or
pnpm add @control.ts/control@latest
## or
yarn add @control.ts/control@latest
```

### Step 2: Update Component Code

Modify your components to work in both server and browser environments.

**Before:**

```typescript
import { Control } from '@control.ts/control';

export class MyComponent extends Control<HTMLDivElement> {
  protected _node: HTMLDivElement;
  protected childComponents: Control[] = [];

  constructor() {
    super();
    this._node = document.createElement('div'); // ❌ Fails on server
    this.render();
  }

  private render() {
    const button = document.createElement('button');
    button.textContent = 'Click me';
    button.onclick = () => alert('Clicked!');
    this._node.appendChild(button);
  }
}
```

**After:**

```typescript
import { Control } from '@control.ts/control';

export class MyComponent extends Control<HTMLDivElement> {
  protected _node: HTMLDivElement;
  protected childComponents: Control[] = [];

  constructor() {
    super();

    // ✅ Environment check
    if (typeof document !== 'undefined') {
      this._node = document.createElement('div');
      this.render();
    } else {
      // SSR fallback
      this._node = { className: 'my-component' } as any;
    }
  }

  private render() {
    const button = document.createElement('button');
    button.textContent = 'Click me';
    button.onclick = () => alert('Clicked!');
    this._node.appendChild(button);
  }
}
```

### Step 3: Create Server Entry Point

Create a new file `src/server.ts`:

```typescript
import express from 'express';
import { renderToDocument } from '@control.ts/control';
import { App } from './app'; // Your main app component

const server = express();

// Serve static files (CSS, JS, images)
server.use(express.static('public'));
server.use(express.static('dist'));

// SSR route
server.get('*', (req, res) => {
  try {
    const html = renderToDocument(new App(), {
      title: 'My Control.ts App',
      meta: [
        { name: 'description', content: 'My awesome app' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      ],
      links: [{ rel: 'stylesheet', href: '/styles/main.css' }],
      scripts: [{ src: '/client.js', type: 'module', defer: 'true' }],
      lang: 'en',
    });

    res.send(html);
  } catch (error) {
    console.error('SSR Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### Step 4: Update Client Entry Point

Update your `src/main.ts` or `src/client.ts`:

**Before:**

```typescript
import { mount } from '@control.ts/control';
import { App } from './app';

const root = document.getElementById('app')!;
const app = new App();
mount(root, app);
```

**After:**

```typescript
import { mountWithHydration } from '@control.ts/control';
import { App } from './app';

const root = document.getElementById('app')!;
// Automatically detects SSR and hydrates
mountWithHydration(root, () => new App());
```

### Step 5: Update Build Configuration

#### For Vite

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        client: resolve(__dirname, 'src/client.ts'),
        server: resolve(__dirname, 'src/server.ts'),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
    ssr: false, // We'll handle SSR manually
  },
});
```

#### For Webpack

Update `webpack.config.js`:

```javascript
module.exports = [
  // Client config
  {
    name: 'client',
    entry: './src/client.ts',
    output: {
      filename: 'client.js',
      path: path.resolve(__dirname, 'dist'),
    },
    target: 'web',
    // ... other client config
  },
  // Server config
  {
    name: 'server',
    entry: './src/server.ts',
    output: {
      filename: 'server.js',
      path: path.resolve(__dirname, 'dist'),
    },
    target: 'node',
    // ... other server config
  },
];
```

### Step 6: Update Package Scripts

Update `package.json`:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "dev:client": "vite",
    "dev:server": "tsx watch src/server.ts",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "tsc src/server.ts --outDir dist",
    "start": "node dist/server.js"
  },
  "devDependencies": {
    "concurrently": "^8.0.0",
    "tsx": "^4.0.0"
  }
}
```

### Step 7: Handle Browser APIs

Wrap browser-specific code with environment checks:

**Before:**

```typescript
class MyComponent extends Control {
  constructor() {
    super();
    window.addEventListener('resize', this.handleResize);
    localStorage.setItem('key', 'value');
    document.cookie = 'theme=dark';
  }
}
```

**After:**

```typescript
class MyComponent extends Control {
  constructor() {
    super();

    // ✅ Check for browser environment
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize);
      localStorage.setItem('key', 'value');
      document.cookie = 'theme=dark';
    }
  }

  destroy() {
    super.destroy();
    // Clean up browser-specific listeners
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize);
    }
  }
}
```

### Step 8: Handle Data Fetching

For components that fetch data:

```typescript
export class UserProfile extends Control<HTMLDivElement> {
  private userData: User | null = null;

  constructor(initialData?: User) {
    super();
    this.userData = initialData || null;

    if (typeof document !== 'undefined') {
      this._node = document.createElement('div');
      if (!this.userData) {
        this.fetchData();
      } else {
        this.render();
      }
    } else {
      this._node = { className: 'user-profile' } as any;
    }
  }

  private async fetchData() {
    // Client-side fetch
    this.userData = await fetch('/api/user').then((r) => r.json());
    this.render();
  }

  private render() {
    if (!this.userData) return;

    const name = document.createElement('h1');
    name.textContent = this.userData.name;
    this._node.appendChild(name);
  }
}

// Server: Fetch and pass data
server.get('/profile', async (req, res) => {
  const userData = await fetchUserFromDatabase(req.userId);
  const html = renderToDocument(new UserProfile(userData), {
    title: `${userData.name}'s Profile`,
    scripts: [
      {
        content: `window.__USER_DATA__ = ${JSON.stringify(userData)}`,
        type: 'text/javascript',
      },
      { src: '/client.js', type: 'module' },
    ],
  });
  res.send(html);
});

// Client: Reuse server data
const userData = (window as any).__USER_DATA__;
mountWithHydration(root, () => new UserProfile(userData));
```

### Step 9: Testing

Test your SSR implementation:

```bash
## Build both client and server
npm run build

## Start the server
npm start

## Visit http://localhost:3000
## View page source - you should see fully rendered HTML
```

### Step 10: Verify Hydration

Open browser DevTools:

1. Check that `__CONTROL_HYDRATION_DATA__` script exists in HTML
2. Ensure no hydration mismatch warnings in console
3. Test that interactive elements work (buttons, forms, etc.)
4. Verify that event handlers are properly attached

## Common Pitfalls

### 1. Using `document` or `window` Without Checks

**❌ Wrong:**

```typescript
const width = window.innerWidth; // Crashes on server
```

**✅ Correct:**

```typescript
const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
```

### 2. Side Effects in Constructors

**❌ Wrong:**

```typescript
constructor() {
  super();
  this.startPolling(); // May cause issues
}
```

**✅ Correct:**

```typescript
constructor() {
  super();
  if (typeof window !== 'undefined') {
    this.startPolling();
  }
}
```

### 3. Timestamps and Random Values

**❌ Wrong:**

```typescript
const timestamp = new Date().toISOString(); // Different on server/client
```

**✅ Correct:**

```typescript
const timestamp = this.props.serverTime || new Date().toISOString();
```

### 4. Not Handling Async Operations

**❌ Wrong:**

```typescript
constructor() {
  super();
  this.fetchData(); // May not complete before render
}
```

**✅ Correct:**

```typescript
async init() {
  await this.fetchData();
  this.render();
}

// Server
const app = new App();
await app.init();
renderToDocument(app);
```

## Gradual Migration

You don't have to migrate everything at once:

### Phase 1: Add SSR Support (No Breaking Changes)

- Update components with environment checks
- Keep existing client-side rendering working
- Components work in both modes

### Phase 2: Add Server (Optional)

- Create server entry point
- Deploy server alongside existing client app
- Test SSR on specific routes

### Phase 3: Enable Hydration

- Update client entry to use `mountWithHydration`
- Hydration automatically detected
- Falls back to client rendering if no SSR data

### Phase 4: Optimize

- Add data fetching on server
- Implement caching strategies
- Fine-tune performance

## Rollback Plan

If you need to rollback:

1. **Keep Client Code Working:**

   ```typescript
   // Client still works without SSR
   import { mount } from '@control.ts/control';
   mount(root, new App());
   ```

2. **Disable Server:**
   - Simply don't deploy the server
   - Serve static `index.html` as before

3. **No Breaking Changes:**
   - Environment checks don't break client-only apps
   - `mountWithHydration` falls back to regular mount

## Performance Checklist

After migration, verify:

- [ ] First Contentful Paint (FCP) improved
- [ ] Time to Interactive (TTI) acceptable
- [ ] No hydration mismatches in console
- [ ] Event handlers working correctly
- [ ] SEO crawlers can read content
- [ ] Page works with JavaScript disabled (progressive enhancement)

## Next Steps

1. Read the [complete SSR Guide](./SSR_GUIDE.md)
2. Check [examples](./src/examples/) for patterns
3. Optimize with caching and code splitting
4. Monitor server performance
5. Set up error tracking for SSR errors

## Getting Help

- GitHub Issues: https://github.com/TELEUZI/control.ts/issues
- Documentation: [SSR_GUIDE.md](./SSR_GUIDE.md)
- Email: ikk.pott@gmail.com

---

Good luck with your SSR migration! 🚀

## Testing Hydration

This guide shows you how to test that SSR hydration works correctly.

## ✅ Automated Tests (Unit & Integration)

We have comprehensive test coverage for hydration:

```bash
npm run test:run
```

**Test Results**: ✅ **39/39 tests passing**

### Test Coverage

The hydration tests (`src/tests/hydration.test.ts`) cover:

- ✅ Complete SSR → Hydration cycle
- ✅ Event handler preservation after hydration
- ✅ Nested component hydration
- ✅ Automatic hydration detection (`mountWithHydration`)
- ✅ Fallback to client rendering when no SSR data
- ✅ Hydration data loading and parsing
- ✅ Malformed data handling
- ✅ Form hydration with submit handlers
- ✅ Multiple independent components
- ✅ Data management and cleanup

### Running Specific Tests

```bash
## Run only hydration tests
npm run test -- hydration

## Run with coverage
npm run coverage

## Watch mode
npm run test
```

## 🌐 Manual Browser Testing

### Option 1: Using the Demo HTML File

We've created a ready-to-use demo file that you can open directly in your browser:

```bash
## Open the demo file
## Location: packages/control/src/examples/hydration-demo.html
```

**In your browser:**

1. Open `hydration-demo.html` in your browser
2. Open DevTools Console (F12)
3. You should see hydration logs:
   ```
   🚀 Client JavaScript loading...
   ✅ Hydration data found!
   ✅ Button hydrated with click handler
   ✅ Counter hydrated with state management
   ✅ Form hydrated with submit handler
   🎉 All components successfully hydrated!
   ```
4. Click the buttons and test interactivity
5. View page source (Ctrl+U) to see the server-rendered HTML

### Option 2: Generate Custom Test File

Use the test generator to create a custom test page:

```bash
cd packages/control

## Run the test generator
npx tsx src/examples/test-hydration.ts

## This creates: hydration-test.html
## Open it in your browser
```

The generator will:

- ✅ Server-render your components
- ✅ Generate complete HTML with hydration data
- ✅ Include client-side hydration script
- ✅ Add visual indicators
- ✅ Log hydration steps to console

### Option 3: Full Server Setup

For a complete production-like setup:

1. **Create a server file** (`server.ts`):

```typescript
import express from 'express';
import { renderToDocument } from '@control.ts/control';
import { App } from './app';

const server = express();

server.use(express.static('public'));

server.get('/', (req, res) => {
  const html = renderToDocument(new App(), {
    title: 'Hydration Test',
    scripts: [{ src: '/client.js', type: 'module' }],
  });
  res.send(html);
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

2. **Create a client file** (`client.ts`):

```typescript
import { mountWithHydration } from '@control.ts/control';
import { App } from './app';

mountWithHydration(document.getElementById('app')!, () => new App());
```

3. **Run the server**:

```bash
npx tsx server.ts
```

4. **Open http://localhost:3000** and test!

## 🔍 What to Look For

### ✅ Signs of Successful Hydration

1. **Immediate Content Display**
   - Page content visible before JavaScript loads
   - No "flash of unstyled content"
   - View source shows full HTML

2. **Hydration Data Script**
   - Look for `<script id="__CONTROL_HYDRATION_DATA__">` in source
   - Contains component metadata as JSON

3. **Console Logs** (if enabled)
   - "Hydration data found"
   - "Components hydrated"
   - No hydration mismatch warnings

4. **Interactive Components**
   - Buttons clickable
   - Forms submittable
   - Event handlers work
   - State updates correctly

5. **Performance**
   - Fast First Contentful Paint (FCP)
   - Quick Time to Interactive (TTI)
   - Check Network tab: HTML arrives first, JS later

### ❌ Signs of Issues

1. **Hydration Mismatches**
   - Console warnings about mismatched HTML
   - Components re-rendering
   - Flickering content

2. **Missing Hydration Data**
   - Warning: "No hydration data found"
   - Fallback to client rendering
   - Blank page until JS loads

3. **Non-Working Events**
   - Buttons don't respond
   - Forms don't submit
   - No console errors but no actions

## 🧪 Testing Checklist

### Basic Hydration Test

- [ ] Open page in browser
- [ ] View page source - see full HTML
- [ ] Check for `__CONTROL_HYDRATION_DATA__` script
- [ ] Open DevTools Console
- [ ] Look for hydration success messages
- [ ] Click buttons - should work
- [ ] Submit forms - should work
- [ ] No console errors

### Performance Test

- [ ] Open DevTools > Network tab
- [ ] Disable cache
- [ ] Throttle to "Fast 3G"
- [ ] Reload page
- [ ] Content appears immediately (from HTML)
- [ ] Interactivity works after JS loads
- [ ] Check Performance tab for FCP/LCP metrics

### Progressive Enhancement Test

- [ ] Open page normally
- [ ] Disable JavaScript in DevTools
- [ ] Reload page
- [ ] Content still visible (SSR works!)
- [ ] Forms with `action` attribute still work
- [ ] Re-enable JavaScript
- [ ] Reload - now interactive

### Edge Cases

- [ ] **Slow Network**: Throttle to "Slow 3G" - content still appears fast
- [ ] **JavaScript Error**: Introduce error - page still displays
- [ ] **Missing Hydration Data**: Remove script - falls back gracefully
- [ ] **Multiple Components**: All hydrate independently
- [ ] **Nested Components**: Children hydrate correctly

## 📊 Automated Test Output

When you run `npm run test:run`, you should see:

```
✓ src/tests/factories.test.ts  (3 tests)
✓ src/tests/ssr.test.ts  (24 tests)
✓ src/tests/hydration.test.ts  (12 tests)

Test Files  3 passed (3)
Tests       39 passed (39)
```

### Key Test Categories

1. **SSR Context Tests** (4 tests)
   - Context creation and management
   - Environment detection

2. **HTML Generation Tests** (10 tests)
   - Element rendering
   - HTML escaping
   - Style serialization
   - Void elements

3. **Document Generation Tests** (6 tests)
   - Complete HTML documents
   - Meta tags, links, scripts
   - Custom attributes

4. **Hydration Cycle Tests** (7 tests)
   - Full SSR → Hydration flow
   - Event handler preservation
   - Nested components
   - Auto-detection

5. **Data Management Tests** (8 tests)
   - Loading hydration data
   - Malformed data handling
   - Cleanup

## 🐛 Debugging Hydration Issues

### Issue: Hydration Mismatches

**Symptoms**: Console warnings about mismatched HTML

**Debug**:

```typescript
// Enable dev mode validation
if (process.env.NODE_ENV === 'development') {
  mountWithHydration(root, () => new App());
}
```

**Common Causes**:

- Timestamps (different on server/client)
- Random values
- Browser-specific code running on server
- Async data not awaited

**Fix**:

```typescript
// ❌ Wrong - different on server/client
const time = new Date().toISOString();

// ✅ Correct - same timestamp from server
const time = props.serverTime || new Date().toISOString();
```

### Issue: Events Not Working

**Symptoms**: Buttons don't respond to clicks

**Debug**:

```typescript
// Check if handlers are attached
const button = document.querySelector('button');
console.log('Button:', button);
console.log('Has onclick:', button.onclick);
```

**Fix**: Ensure handlers attached during construction:

```typescript
class Button extends Control {
  constructor(onClick: () => void) {
    super();
    if (typeof document !== 'undefined') {
      this._node = document.createElement('button');
      this._node.onclick = onClick; // ✅ Attach here
    }
  }
}
```

### Issue: No Hydration Data

**Symptoms**: "No hydration data found" warning

**Check**:

1. Is `__CONTROL_HYDRATION_DATA__` script in HTML?
2. Is the script type `application/json`?
3. Is the JSON valid?

**Debug**:

```typescript
const script = document.getElementById('__CONTROL_HYDRATION_DATA__');
console.log('Script exists:', !!script);
console.log('Content:', script?.textContent);
```

## 📈 Performance Metrics

Good SSR performance targets:

| Metric                 | Target  | Measurement            |
| ---------------------- | ------- | ---------------------- |
| First Contentful Paint | < 1.5s  | DevTools > Performance |
| Time to Interactive    | < 3.5s  | DevTools > Performance |
| Hydration Time         | < 200ms | Console logs           |
| Total Blocking Time    | < 300ms | Lighthouse             |

### Measuring Performance

```javascript
// Add to client.ts
const start = performance.now();

mountWithHydration(root, () => new App());

const end = performance.now();
console.log(`Hydration took ${end - start}ms`);
```

## 🎯 Best Practices

1. **Always Test In Multiple Browsers**
   - Chrome, Firefox, Safari
   - Mobile browsers

2. **Test With Various Network Speeds**
   - Fast 3G, Slow 3G, Offline
   - Use DevTools Network throttling

3. **Test With JavaScript Disabled**
   - Content should still be visible
   - Forms should have fallbacks

4. **Monitor Console**
   - No hydration warnings
   - No errors
   - Clean logs

5. **Use Performance Tools**
   - Lighthouse
   - WebPageTest
   - DevTools Performance tab

## 📝 Example Test Session

```bash
## 1. Run automated tests
npm run test:run
## ✅ All tests passing

## 2. Generate test HTML
cd packages/control
npx tsx src/examples/test-hydration.ts
## ✅ hydration-test.html created

## 3. Open in browser
open hydration-test.html
## OR on Windows: start hydration-test.html

## 4. Check console
## ✅ Hydration success logs
## ✅ No errors

## 5. Test interactivity
## Click buttons ✅
## Submit forms ✅
## Update state ✅

## 6. View source
## ✅ Full HTML visible
## ✅ Hydration data present

## 7. Test performance
## DevTools > Network (throttle to Fast 3G)
## ✅ Content visible immediately
## ✅ Interactive after ~200ms
```

## ✅ Success Criteria

Your hydration is working correctly when:

- ✅ All 39 automated tests pass
- ✅ Manual browser test shows content immediately
- ✅ Console logs show successful hydration
- ✅ No hydration mismatch warnings
- ✅ All interactive elements work
- ✅ Page works with JavaScript disabled (content visible)
- ✅ Performance metrics meet targets
- ✅ Works across different browsers
- ✅ Works on slow networks

## 🚀 Next Steps

Once hydration is working:

1. **Optimize Performance**
   - Implement caching
   - Code splitting
   - Lazy hydration (future)

2. **Add Monitoring**
   - Track hydration errors
   - Monitor performance metrics
   - Log hydration success rate

3. **Production Deploy**
   - Set up server environment
   - Configure CDN
   - Enable compression

---

**Happy Testing!** 🧪

If you encounter issues, check:

- [SSR Guide](./SSR_GUIDE.md)
- [Migration Guide](#migration-guide-adding-ssr-to-existing-controlts-apps)
- [GitHub Issues](https://github.com/TELEUZI/control.ts/issues)

## Quick Reference

Quick reference for using SSR in Control.ts applications.

## 📦 Installation

```bash
npm install @control.ts/control@latest
```

## 🚀 Quick Start

### Server (Node.js)

```typescript
import { renderToDocument } from '@control.ts/control';
import { App } from './app';

const html = renderToDocument(new App(), {
  title: 'My App',
  scripts: [{ src: '/client.js', type: 'module' }],
});

response.send(html);
```

### Client (Browser)

```typescript
import { mountWithHydration } from '@control.ts/control';
import { App } from './app';

mountWithHydration(document.getElementById('app')!, () => new App());
```

### Component (Universal)

```typescript
import { Control } from '@control.ts/control';

export class App extends Control<HTMLDivElement> {
  protected _node: HTMLDivElement;
  protected childComponents: Control[] = [];

  constructor() {
    super();

    if (typeof document !== 'undefined') {
      this._node = document.createElement('div');
      this.render();
    } else {
      this._node = { className: 'app' } as any;
    }
  }

  private render() {
    // Your rendering logic
  }
}
```

## 📚 API Reference

### Server-Side APIs

| Function                               | Purpose        | Usage                                     |
| -------------------------------------- | -------------- | ----------------------------------------- |
| `createSSRContext()`                   | Initialize SSR | `createSSRContext()`                      |
| `renderToDocument(app, opts)`          | Full HTML doc  | `renderToDocument(app, { title: 'App' })` |
| `renderControlToString(comp)`          | Component HTML | `renderControlToString(component)`        |
| `renderToString(tag, props, children)` | Element HTML   | `renderToString('div', {}, [])`           |
| `clearSSRContext()`                    | Cleanup        | `clearSSRContext()`                       |
| `isServerEnvironment()`                | Check env      | `if (isServerEnvironment()) {...}`        |

### Client-Side APIs

| Function                        | Purpose        | Usage                                       |
| ------------------------------- | -------------- | ------------------------------------------- |
| `mountWithHydration(root, app)` | Smart mount    | `mountWithHydration(root, () => new App())` |
| `hydrate(rootElement, app)`     | Manual hydrate | `hydrate(root, app)`                        |
| `isHydrationAvailable()`        | Check SSR data | `if (isHydrationAvailable()) {...}`         |
| `loadHydrationData()`           | Get SSR data   | `const data = loadHydrationData()`          |
| `clearHydrationData()`          | Cleanup        | `clearHydrationData()`                      |

### Universal APIs

| Function                             | Purpose           | Usage                                              |
| ------------------------------------ | ----------------- | -------------------------------------------------- |
| `createElementFactoryUniversal(tag)` | Universal factory | `const div = createElementFactoryUniversal('div')` |
| `h(tag, props, ...children)`         | Virtual DOM       | `h('div', { class: 'app' }, 'Hello')`              |
| `renderVNode(vnode)`                 | VNode to HTML     | `renderVNode(vnode)`                               |
| `vNodeToElement(vnode)`              | VNode to DOM      | `vNodeToElement(vnode)`                            |

## 🔧 Common Patterns

### Environment Check

```typescript
// ✅ Correct
if (typeof document !== 'undefined') {
  // Browser-only code
}

if (typeof window !== 'undefined') {
  // Browser-only code
}

// ❌ Wrong
document.createElement('div'); // Crashes on server
```

### Data Fetching

```typescript
// Server
const data = await fetchData();
const html = renderToDocument(new App(data), {
  scripts: [{ content: `window.__DATA__ = ${JSON.stringify(data)}` }, { src: '/client.js', type: 'module' }],
});

// Client
const data = (window as any).__DATA__;
mountWithHydration(root, () => new App(data));
```

### Event Handlers

```typescript
// ✅ Correct - attached in render
class Button extends Control {
  render() {
    const btn = document.createElement('button');
    btn.onclick = () => alert('Clicked!');
    this._node.append(btn);
  }
}

// ❌ Wrong - side effect in constructor
class Button extends Control {
  constructor() {
    super();
    window.addEventListener('click', this.handler); // Fails on server
  }
}
```

### Conditional Rendering

```typescript
class App extends Control {
  constructor() {
    super();

    if (typeof document !== 'undefined') {
      this._node = document.createElement('div');

      // Browser-specific features
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this._node.classList.add('dark-mode');
      }

      this.render();
    } else {
      // SSR fallback
      this._node = { className: 'app' } as any;
    }
  }
}
```

## 📝 renderToDocument Options

```typescript
renderToDocument(app, {
  // Page title
  title: 'My App',

  // Meta tags
  meta: [
    { name: 'description', content: 'My app description' },
    { property: 'og:title', content: 'My App' },
    { charset: 'UTF-8' },
  ],

  // Stylesheets
  links: [
    { rel: 'stylesheet', href: '/styles.css' },
    { rel: 'icon', href: '/favicon.ico' },
  ],

  // Scripts
  scripts: [
    { src: '/client.js', type: 'module', defer: 'true' },
    { content: 'console.log("inline")', type: 'text/javascript' },
  ],

  // Language
  lang: 'en',

  // Custom head content
  head: '<link rel="preconnect" href="https://fonts.googleapis.com">',

  // Body attributes
  bodyAttrs: {
    'data-theme': 'dark',
    className: 'custom-body',
  },
});
```

## 🎯 Express.js Integration

```typescript
import express from 'express';
import { renderToDocument } from '@control.ts/control';

const app = express();

app.use(express.static('public'));

app.get('*', (req, res) => {
  try {
    const html = renderToDocument(new App(), {
      title: 'My App',
    });
    res.send(html);
  } catch (error) {
    console.error('SSR Error:', error);
    res.status(500).send('Error');
  }
});

app.listen(3000);
```

## ⚡ Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        client: './src/client.ts',
        server: './src/server.ts',
      },
    },
  },
});
```

## 🐛 Troubleshooting

| Problem                   | Solution                                                      |
| ------------------------- | ------------------------------------------------------------- |
| `document is not defined` | Add environment check: `if (typeof document !== 'undefined')` |
| `window is not defined`   | Add environment check: `if (typeof window !== 'undefined')`   |
| Hydration mismatch        | Ensure server and client render identically                   |
| Events not working        | Attach handlers in component render method                    |
| Memory leak on server     | Call `clearSSRContext()` after rendering                      |

## ✅ Checklist

### Component Checklist

- [ ] Environment checks for browser APIs
- [ ] No side effects in constructor
- [ ] Event handlers attached in render
- [ ] Consistent server/client output
- [ ] Proper cleanup in destroy()

### Server Checklist

- [ ] Create SSR context before rendering
- [ ] Handle errors gracefully
- [ ] Clear context after rendering
- [ ] Serve static files correctly
- [ ] Set proper content-type headers

### Client Checklist

- [ ] Use `mountWithHydration` for SSR pages
- [ ] Load hydration data before mounting
- [ ] Handle missing hydration data
- [ ] Test with JavaScript disabled
- [ ] Verify event handlers work

## 📊 Performance Tips

1. **Cache rendered HTML** for static pages
2. **Minimize hydration data** - only serialize essentials
3. **Code split** by route
4. **Lazy load** non-critical components
5. **Stream rendering** for large pages (future)

## 🔗 Resources

- [Full SSR Guide](./SSR_GUIDE.md)
- [Migration Guide](#migration-guide-adding-ssr-to-existing-controlts-apps)
- [Implementation Architecture](./SSR_ARCHITECTURE.md)
- [Examples](./src/examples/)
- [Tests](./src/tests/ssr.test.ts)

## 💡 Pro Tips

### Tip 1: Progressive Enhancement

```typescript
// Form works without JavaScript
<form action="/api/submit" method="POST">
  <input name="email" required />
  <button type="submit">Submit</button>
</form>
```

### Tip 2: Lazy Hydration (Future)

```typescript
// Hydrate when visible
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    hydrate(root, component);
  }
});
```

### Tip 3: Error Boundaries

```typescript
try {
  const html = renderToDocument(app);
  res.send(html);
} catch (error) {
  // Fallback to client-only
  res.send(fallbackHtml);
}
```

### Tip 4: Development Mode

```typescript
if (process.env.NODE_ENV === 'development') {
  // Enable hydration validation
  verifyHydration(serverEl, clientEl);
}
```

## 🎓 Learning Path

1. ✅ Read this quick reference
2. ✅ Try simple examples
3. ✅ Read full SSR Guide
4. ✅ Migrate existing app
5. ✅ Optimize performance
6. ✅ Deploy to production

---

**Need Help?**

- GitHub: https://github.com/TELEUZI/control.ts
- Email: ikk.pott@gmail.com

## Examples & Support

See the `/src/examples` directory for complete examples:

- `ssr-server.example.ts` - Server-side setup
- `ssr-client.example.ts` - Client-side hydration

For issues or questions, visit our [GitHub repository](https://github.com/TELEUZI/control.ts) or reach out via email.

---

**Happy SSR coding!** 🚀
