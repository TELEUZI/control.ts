# SSR Guide for @control.ts/signals

This guide shows how to use Server-Side Rendering with the `@control.ts/signals` package, which includes reactive signals powered by `@preact/signals-core`.

## Quick Start

### Server (Node.js)

```typescript
import { signal } from '@preact/signals-core';
import { BaseComponent } from '@control.ts/signals';
import { createSSRContext, renderToDocument } from '@control.ts/signals';

// Create reactive app
class Counter extends BaseComponent {
  constructor(initialCount: number) {
    const count = signal(initialCount);

    super(
      { tag: 'div', className: 'counter' },
      new BaseComponent({ tag: 'span', txt: count }), // Reactive text
      new BaseComponent({
        tag: 'button',
        txt: '+',
        onclick: () => count.value++,
      }),
    );
  }
}

// Server route
app.get('/', (req, res) => {
  createSSRContext();
  const html = renderToDocument(new Counter(0), {
    title: 'Reactive Counter',
    scripts: [{ src: '/client.js', type: 'module' }],
  });
  res.send(html);
});
```

### Client (Browser)

```typescript
import { Counter } from './app';
import { mountWithHydration } from '@control.ts/signals';

// Signals automatically reconnect on hydration
mountWithHydration(document.getElementById('app')!, () => new Counter(0));
```

## Signals + SSR

The signals package extends BaseComponent with reactive signal support:

```typescript
import { signal } from '@preact/signals-core';
import { BaseComponent } from '@control.ts/signals';

class ReactiveComponent extends BaseComponent {
  constructor() {
    // Create signals
    const name = signal('World');
    const count = signal(0);

    // Signals work in props
    super(
      { tag: 'div' },
      new BaseComponent({ tag: 'h1', txt: name }), // Reactive
      new BaseComponent({ tag: 'p', txt: count }), // Reactive
      new BaseComponent({
        tag: 'button',
        txt: 'Increment',
        onclick: () => count.value++,
      }),
    );
  }
}
```

### How Signals Work with SSR

1. **Server**: Signals render their current value to HTML
2. **Client**: Signals reconnect and become reactive
3. **Hydration**: Components maintain their reactive subscriptions

## Signal Props

Props can be signals or regular values:

```typescript
import { signal, computed } from '@preact/signals-core';
import { BaseComponent } from '@control.ts/signals';

class UserCard extends BaseComponent {
  constructor(userId: number) {
    const user = signal({ name: 'John', age: 30 });
    const greeting = computed(() => `Hello, ${user.value.name}!`);

    super(
      {
        tag: 'div',
        className: 'user-card',
        // Signal prop - reactive attribute
        title: computed(() => `User ${userId}`),
      },
      new BaseComponent({ tag: 'h2', txt: greeting }), // Computed signal
      new BaseComponent({
        tag: 'p',
        txt: computed(() => `Age: ${user.value.age}`),
      }),
      new BaseComponent({
        tag: 'button',
        txt: 'Birthday',
        onclick: () => (user.value = { ...user.value, age: user.value.age + 1 }),
      }),
    );
  }
}
```

## Signal Children

Children can also be signals for conditional rendering:

```typescript
import { signal } from '@preact/signals-core';
import { BaseComponent } from '@control.ts/signals';

class ConditionalComponent extends BaseComponent {
  constructor() {
    const showMessage = signal(true);
    const message = signal(showMessage.value ? new BaseComponent({ tag: 'p', txt: 'Visible!' }) : null);

    super(
      { tag: 'div' },
      message, // Signal child - conditional rendering
      new BaseComponent({
        tag: 'button',
        txt: 'Toggle',
        onclick: () => {
          showMessage.value = !showMessage.value;
          message.value = showMessage.value ? new BaseComponent({ tag: 'p', txt: 'Visible!' }) : null;
        },
      }),
    );
  }
}
```

## Complete Example with State Management

### Shared State (`store.ts`)

```typescript
import { signal, computed } from '@preact/signals-core';

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// Global reactive store
export const todos = signal<Todo[]>([]);
export const filter = signal<'all' | 'active' | 'completed'>('all');

export const filteredTodos = computed(() => {
  const allTodos = todos.value;
  switch (filter.value) {
    case 'active':
      return allTodos.filter((t) => !t.completed);
    case 'completed':
      return allTodos.filter((t) => t.completed);
    default:
      return allTodos;
  }
});

export const activeTodosCount = computed(() => todos.value.filter((t) => !t.completed).length);

export function addTodo(text: string) {
  todos.value = [...todos.value, { id: Date.now(), text, completed: false }];
}

export function toggleTodo(id: number) {
  todos.value = todos.value.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo));
}

export function deleteTodo(id: number) {
  todos.value = todos.value.filter((t) => t.id !== id);
}
```

### Components (`components.ts`)

```typescript
import { BaseComponent } from '@control.ts/signals';
import { todos, filteredTodos, filter, addTodo, toggleTodo, deleteTodo } from './store';
import { computed } from '@preact/signals-core';

export class TodoItem extends BaseComponent {
  constructor(todo: { id: number; text: string; completed: boolean }) {
    super(
      {
        tag: 'div',
        className: computed(() => `todo-item ${todo.completed ? 'completed' : ''}`),
      },
      new BaseComponent({
        tag: 'input',
        type: 'checkbox',
        checked: todo.completed,
        onchange: () => toggleTodo(todo.id),
      }),
      new BaseComponent({ tag: 'span', txt: todo.text }),
      new BaseComponent({
        tag: 'button',
        txt: '×',
        onclick: () => deleteTodo(todo.id),
      }),
    );
  }
}

export class TodoList extends BaseComponent {
  constructor() {
    // Map signal array to components
    const todoComponents = computed(() => filteredTodos.value.map((todo) => new TodoItem(todo)));

    super(
      { tag: 'div', className: 'todo-list' },
      ...todoComponents.value, // Reactive list
    );

    // Re-render on changes
    this.subscribe(
      filteredTodos.subscribe(() => {
        this._node.innerHTML = '';
        this._appendChildren(todoComponents.value);
      }),
    );
  }
}

export class TodoApp extends BaseComponent {
  constructor() {
    super(
      { tag: 'div', className: 'todo-app' },
      new BaseComponent({ tag: 'h1', txt: 'Reactive Todos' }),

      // Input
      (() => {
        const input = new BaseComponent({
          tag: 'input',
          type: 'text',
          placeholder: 'What needs to be done?',
        });

        const form = new BaseComponent(
          {
            tag: 'form',
            onsubmit: (e: Event) => {
              e.preventDefault();
              const value = (input._node as HTMLInputElement).value;
              if (value.trim()) {
                addTodo(value);
                (input._node as HTMLInputElement).value = '';
              }
            },
          },
          input,
          new BaseComponent({ tag: 'button', txt: 'Add', type: 'submit' }),
        );

        return form;
      })(),

      // Todo list
      new TodoList(),

      // Footer with filters
      new BaseComponent(
        { tag: 'footer' },
        new BaseComponent({
          tag: 'span',
          txt: computed(() => `${activeTodosCount.value} items left`),
        }),
        new BaseComponent(
          { tag: 'div', className: 'filters' },
          new BaseComponent({
            tag: 'button',
            txt: 'All',
            onclick: () => (filter.value = 'all'),
            className: computed(() => (filter.value === 'all' ? 'active' : '')),
          }),
          new BaseComponent({
            tag: 'button',
            txt: 'Active',
            onclick: () => (filter.value = 'active'),
            className: computed(() => (filter.value === 'active' ? 'active' : '')),
          }),
          new BaseComponent({
            tag: 'button',
            txt: 'Completed',
            onclick: () => (filter.value = 'completed'),
            className: computed(() => (filter.value === 'completed' ? 'active' : '')),
          }),
        ),
      ),
    );
  }
}
```

### Server (`server.ts`)

```typescript
import express from 'express';
import { createSSRContext, renderToDocument, serializeSignalState } from '@control.ts/signals';
import { TodoApp } from './components';
import { todos } from './store';

const server = express();

server.use(express.static('public'));

server.get('/', async (req, res) => {
  createSSRContext();

  // Fetch initial data
  const initialTodos = await fetchTodosFromDatabase();
  todos.value = initialTodos;

  // Serialize signal state for client
  const signalState = serializeSignalState({ todos: todos.value });

  const html = renderToDocument(new TodoApp(), {
    title: 'Reactive Todo App',
    scripts: [
      {
        content: `window.__SIGNAL_STATE__ = ${signalState}`,
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
import { mountWithHydration, loadSignalState } from '@control.ts/signals';
import { TodoApp } from './components';
import { todos } from './store';

// Restore signal state from server
const state = loadSignalState<{ todos: any[] }>();
if (state) {
  todos.value = state.todos;
}

// Mount with hydration - signals automatically reconnect
mountWithHydration(document.getElementById('app')!, () => new TodoApp());
```

## API Reference

### Server-Side APIs

All base SSR APIs plus:

#### `serializeSignalState(state)`

Serialize signal values for client hydration.

```typescript
import { serializeSignalState } from '@control.ts/signals';

const state = { count: countSignal.value, user: userSignal.value };
const json = serializeSignalState(state);
```

### Client-Side APIs

All base hydration APIs plus:

#### `loadSignalState<T>()`

Load serialized signal state from server.

```typescript
import { loadSignalState } from '@control.ts/signals';

const state = loadSignalState<{ count: number }>();
if (state) {
  countSignal.value = state.count;
}
```

## Best Practices

### 1. Initialize Signals on Server

```typescript
// Server
const count = signal(initialValue);
const html = renderToDocument(new Counter(count.value));
```

### 2. Restore Signal State on Client

```typescript
// Client
const state = loadSignalState();
const count = signal(state?.count || 0);
```

### 3. Use Computed for Derived State

```typescript
const firstName = signal('John');
const lastName = signal('Doe');
const fullName = computed(() => `${firstName.value} ${lastName.value}`);
```

### 4. Batch Updates

```typescript
import { batch } from '@preact/signals-core';

batch(() => {
  user.value = newUser;
  todos.value = newTodos;
  filter.value = 'all';
});
```

## Signal SSR Behavior

### Server Rendering

- Signals render their **current value**
- No subscriptions created
- Computed signals evaluated once
- Props resolved to values

### Client Hydration

- Signals reconnect subscriptions
- Reactive updates resume
- DOM elements reused
- Event handlers attached

### Example Flow

```typescript
// Server
const count = signal(5);
// Renders: <span>5</span>

// Client
const count = signal(5); // Same initial value
// After hydration: clicking button updates count reactively
```

## Performance Tips

1. **Minimize Signal Creation**: Create signals outside components when possible
2. **Use Computed**: Don't recreate derived values
3. **Batch Updates**: Use `batch()` for multiple signal changes
4. **Memo Components**: Cache expensive component creation
5. **Lazy Load**: Split code by route

## See Also

- [@preact/signals Documentation](https://preactjs.com/guide/v10/signals/)
- [Base SSR Guide](../control/SSR_GUIDE.md)
- [Min Package Guide](../min/SSR_GUIDE.md)

---

**Ready to use reactive SSR with @control.ts/signals!** ⚡🚀
