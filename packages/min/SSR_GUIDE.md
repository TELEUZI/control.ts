# SSR Guide for @control.ts/min

This guide shows how to use Server-Side Rendering with the `@control.ts/min` package.

## Quick Start

### Server (Node.js)

```typescript
import { BaseComponent } from '@control.ts/min';
import { createSSRContext, renderToDocument } from '@control.ts/min';

// Create your app component
class App extends BaseComponent {
  constructor() {
    super(
      { tag: 'div', className: 'app' },
      new BaseComponent({ tag: 'h1', txt: 'Hello SSR!' }),
      new BaseComponent({ tag: 'button', txt: 'Click Me', onclick: () => alert('Hi!') }),
    );
  }
}

// Server route
app.get('/', (req, res) => {
  createSSRContext();
  const html = renderToDocument(new App(), {
    title: 'My App',
    scripts: [{ src: '/client.js', type: 'module' }],
  });
  res.send(html);
});
```

### Client (Browser)

```typescript
import { App } from './app';
import { mountWithHydration } from '@control.ts/min';

// Automatically detects and hydrates
mountWithHydration(document.getElementById('app')!, () => new App());
```

## BaseComponent with SSR

The `BaseComponent` in `@control.ts/min` accepts props and children in the constructor:

```typescript
import { BaseComponent } from '@control.ts/min';

class Card extends BaseComponent {
  constructor(title: string, content: string) {
    super(
      { tag: 'div', className: 'card' },
      new BaseComponent({ tag: 'h2', txt: title }),
      new BaseComponent({ tag: 'p', txt: content }),
    );
  }
}

// Usage
const card = new Card('Title', 'Content');
```

### Environment Checks

BaseComponent creates DOM elements in the constructor, so add checks:

```typescript
class MyComponent extends BaseComponent {
  constructor() {
    // Check if in browser
    if (typeof document !== 'undefined') {
      super({ tag: 'div' });
      this.setupInteractivity();
    } else {
      // SSR mode - minimal setup
      super({ tag: 'div' });
    }
  }

  private setupInteractivity() {
    // Browser-only code
    this._node.addEventListener('click', () => {
      console.log('Clicked!');
    });
  }
}
```

## Using Functional Components

The `min` package has `bcToFc` for functional-style components:

```typescript
import { BaseComponent, bcToFc } from '@control.ts/min';

class ButtonComponent extends BaseComponent {
  constructor(text: string, onClick: () => void) {
    super({ tag: 'button', txt: text, onclick: onClick });
  }
}

// Convert to functional component
const Button = bcToFc(ButtonComponent);

// Usage
const myButton = Button('Click Me', () => alert('Clicked!'));
```

### SSR with Functional Components

```typescript
// Server
import { createSSRContext, renderToDocument } from '@control.ts/min';

const app = Button('SSR Button', () => console.log('Hydrated!'));
const html = renderToDocument(app, { title: 'Functional SSR' });

// Client
import { mountWithHydration } from '@control.ts/min';

mountWithHydration(document.getElementById('app')!, () => Button('SSR Button', () => console.log('Hydrated!')));
```

## Complete Example

### App Component (`app.ts`)

```typescript
import { BaseComponent } from '@control.ts/min';

export class TodoItem extends BaseComponent {
  constructor(text: string, onDelete: () => void) {
    super(
      { tag: 'div', className: 'todo-item' },
      new BaseComponent({ tag: 'span', txt: text }),
      new BaseComponent({
        tag: 'button',
        txt: 'Delete',
        onclick: onDelete,
      }),
    );
  }
}

export class TodoApp extends BaseComponent {
  private todos: string[] = [];

  constructor(initialTodos: string[] = []) {
    super({ tag: 'div', className: 'todo-app' });
    this.todos = initialTodos;
    this.render();
  }

  private render() {
    const title = new BaseComponent({ tag: 'h1', txt: 'Todo List' });

    const todoList = new BaseComponent(
      { tag: 'div', className: 'todos' },
      ...this.todos.map((todo, index) => new TodoItem(todo, () => this.deleteTodo(index))),
    );

    const input = new BaseComponent({
      tag: 'input',
      type: 'text',
      placeholder: 'Add todo...',
    });

    const addButton = new BaseComponent({
      tag: 'button',
      txt: 'Add',
      onclick: () => {
        const value = (input._node as HTMLInputElement).value;
        if (value) {
          this.addTodo(value);
          (input._node as HTMLInputElement).value = '';
        }
      },
    });

    this._appendChildren([title, todoList, input, addButton]);
  }

  private addTodo(text: string) {
    this.todos.push(text);
    this.render();
  }

  private deleteTodo(index: number) {
    this.todos.splice(index, 1);
    this.render();
  }
}
```

### Server (`server.ts`)

```typescript
import express from 'express';
import { createSSRContext, renderToDocument } from '@control.ts/min';
import { TodoApp } from './app';

const server = express();

server.use(express.static('public'));

server.get('/', (req, res) => {
  createSSRContext();

  // Fetch initial data (e.g., from database)
  const initialTodos = ['Buy groceries', 'Walk the dog', 'Write code'];

  const html = renderToDocument(new TodoApp(initialTodos), {
    title: 'Todo App - SSR',
    scripts: [
      {
        content: `window.__INITIAL_STATE__ = ${JSON.stringify({ todos: initialTodos })}`,
        type: 'text/javascript',
      },
      { src: '/client.js', type: 'module' },
    ],
    links: [{ rel: 'stylesheet', href: '/styles.css' }],
  });

  res.send(html);
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### Client (`client.ts`)

```typescript
import { mountWithHydration } from '@control.ts/min';
import { TodoApp } from './app';

// Get initial state from server
const initialState = (window as any).__INITIAL_STATE__;

// Mount with hydration
mountWithHydration(document.getElementById('app')!, () => new TodoApp(initialState.todos));
```

## API Reference

### Server-Side APIs

#### `createSSRContext()`

Initialize SSR context before rendering.

```typescript
import { createSSRContext } from '@control.ts/min';
createSSRContext();
```

#### `renderToDocument(component, options)`

Render complete HTML document with component.

```typescript
import { renderToDocument } from '@control.ts/min';

const html = renderToDocument(new App(), {
  title: 'My App',
  meta: [{ name: 'description', content: 'My app' }],
  scripts: [{ src: '/client.js', type: 'module' }],
  links: [{ rel: 'stylesheet', href: '/styles.css' }],
});
```

#### `renderComponentToString(component)`

Render just the component HTML.

```typescript
import { renderComponentToString } from '@control.ts/min';

const html = renderComponentToString(new MyComponent());
```

### Client-Side APIs

#### `mountWithHydration(root, app)`

Mount with automatic hydration detection.

```typescript
import { mountWithHydration } from '@control.ts/min';

mountWithHydration(document.getElementById('app')!, () => new App());
```

#### `hydrateComponent(component)`

Manually hydrate a component.

```typescript
import { hydrateComponent } from '@control.ts/min';

const app = new App();
hydrateComponent(app);
```

#### `mount(root, app)`

Regular mount without hydration.

```typescript
import { mount } from '@control.ts/min';

mount(document.getElementById('app')!, new App());
```

## Best Practices

### 1. Props and Children Pattern

Always use props and children in constructor:

```typescript
class MyComponent extends BaseComponent {
  constructor(title: string, items: string[]) {
    super(
      { tag: 'div', className: 'my-component' },
      new BaseComponent({ tag: 'h1', txt: title }),
      ...items.map((item) => new BaseComponent({ tag: 'p', txt: item })),
    );
  }
}
```

### 2. State Management

Pass initial state from server:

```typescript
// Server
const html = renderToDocument(new App(initialData), {
  scripts: [
    {
      content: `window.__STATE__ = ${JSON.stringify(initialData)}`,
    },
  ],
});

// Client
const state = (window as any).__STATE__;
mountWithHydration(root, () => new App(state));
```

### 3. Event Handlers

Attach in constructor or after creation:

```typescript
class Button extends BaseComponent {
  constructor(text: string, onClick: () => void) {
    super({ tag: 'button', txt: text });

    if (typeof document !== 'undefined') {
      this._node.onclick = onClick;
    }
  }
}
```

## Differences from Base Control

The `min` package's `BaseComponent` differs from `@control.ts/control`'s `Control`:

| Feature          | `Control` (base)        | `BaseComponent` (min)       |
| ---------------- | ----------------------- | --------------------------- |
| Constructor      | No params               | Props + children            |
| Node creation    | Manual in constructor   | Automatic                   |
| Child management | `childComponents` array | `childComponents` array     |
| Props            | Set after creation      | Set in constructor          |
| Proxy            | No                      | Yes (for HTMLElement props) |

### Migration from Control Examples

The SSR examples in the base `control` package use `Control` class. For `min`, adapt them:

**Base Control:**

```typescript
class App extends Control<HTMLDivElement> {
  protected _node: HTMLDivElement;

  constructor() {
    super();
    this._node = document.createElement('div');
    this.render();
  }
}
```

**Min BaseComponent:**

```typescript
class App extends BaseComponent {
  constructor() {
    super({ tag: 'div', className: 'app' });
    // Children added in super() call or via _appendChildren()
  }
}
```

## See Also

- [Base SSR Guide](../control/SSR_GUIDE.md) - Core SSR concepts
- [Testing Guide](../control/SSR_GUIDE.md#testing-hydration) - Testing hydration
- [Migration Guide](../control/SSR_GUIDE.md#migration-guide-adding-ssr-to-existing-controlts-apps) - Adding SSR to existing apps

---

**Ready to use SSR with @control.ts/min!** 🚀
