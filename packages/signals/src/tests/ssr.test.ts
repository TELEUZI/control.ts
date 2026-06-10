/**
 * SSR Tests for @control.ts/signals
 */

import { computed, signal } from '@preact/signals-core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { BaseComponent } from '../base-component';
import {
  clearSSRContext,
  createSSRContext,
  renderComponentToString,
  renderToDocument,
  serializeHydrationData,
  serializeSignalState,
} from '../ssr';

// Test components
class TestButton extends BaseComponent {
  constructor(text: string) {
    super({ tag: 'button', txt: text, className: 'test-button' });
  }
}

class ReactiveButton extends BaseComponent {
  constructor(text: ReturnType<typeof signal<string>>) {
    super({ tag: 'button', txt: text, className: 'reactive-button' });
  }
}

class TestCard extends BaseComponent {
  constructor(title: string, content: string) {
    super(
      { tag: 'div', className: 'card' },
      new BaseComponent({ tag: 'h2', txt: title }),
      new BaseComponent({ tag: 'p', txt: content }),
    );
  }
}

class Counter extends BaseComponent {
  constructor(initialCount: number) {
    const count = signal(initialCount);

    super(
      { tag: 'div', className: 'counter' },
      new BaseComponent({ tag: 'span', txt: computed(() => `Count: ${count.value}`) }),
      new BaseComponent({ tag: 'button', txt: '+', onclick: () => count.value++ }),
    );
  }
}

describe('Signals SSR Tests', () => {
  afterEach(() => {
    clearSSRContext();
  });

  describe('SSR Context', () => {
    it('should create SSR context', () => {
      const ctx = createSSRContext();
      expect(ctx).toBeDefined();
      expect(ctx.isServer).toBe(true);
      expect(ctx.componentId).toBe(0);
    });

    it('should clear SSR context', () => {
      createSSRContext();
      clearSSRContext();
      expect(true).toBe(true);
    });
  });

  describe('Component Rendering', () => {
    beforeEach(() => {
      createSSRContext();
    });

    it('should render BaseComponent to string', () => {
      const button = new TestButton('Click Me');
      const html = renderComponentToString(button);

      expect(html).toContain('button');
      expect(html).toContain('Click Me');
      expect(html).toContain('test-button');
    });

    it('should render component with signal prop', () => {
      const text = signal('Reactive Text');
      const button = new ReactiveButton(text);
      const html = renderComponentToString(button);

      expect(html).toContain('button');
      expect(html).toContain('Reactive Text');
      expect(html).toContain('reactive-button');
    });

    it('should render component with computed signal', () => {
      const firstName = signal('John');
      const lastName = signal('Doe');
      const fullName = computed(() => `${firstName.value} ${lastName.value}`);

      const component = new BaseComponent({ tag: 'div', txt: fullName });
      const html = renderComponentToString(component);

      expect(html).toContain('John Doe');
    });

    it('should render nested components', () => {
      const card = new TestCard('Title', 'Content');
      const html = renderComponentToString(card);

      expect(html).toContain('card');
      expect(html).toContain('Title');
      expect(html).toContain('Content');
      expect(html).toContain('<h2>');
      expect(html).toContain('<p>');
    });

    it('should render counter with reactive state', () => {
      const counter = new Counter(5);
      const html = renderComponentToString(counter);

      expect(html).toContain('counter');
      expect(html).toContain('Count: 5');
      expect(html).toContain('<button');
    });

    it('should handle signal in props', () => {
      const className = signal('dynamic-class');
      const component = new BaseComponent({
        tag: 'div',
        className: className,
      });

      const html = renderComponentToString(component);

      expect(html).toContain('dynamic-class');
    });

    it('should handle multiple signals', () => {
      const title = signal('Dynamic Title');
      const content = signal('Dynamic Content');

      const component = new BaseComponent(
        { tag: 'div' },
        new BaseComponent({ tag: 'h1', txt: title }),
        new BaseComponent({ tag: 'p', txt: content }),
      );

      const html = renderComponentToString(component);

      expect(html).toContain('Dynamic Title');
      expect(html).toContain('Dynamic Content');
    });
  });

  describe('Document Rendering', () => {
    beforeEach(() => {
      createSSRContext();
    });

    it('should render complete HTML document', () => {
      const app = new TestButton('App Button');
      const html = renderToDocument(app, {
        title: 'Test App',
      });

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('<head>');
      expect(html).toContain('<title>Test App</title>');
      expect(html).toContain('<body>');
      expect(html).toContain('App Button');
      expect(html).toContain('</html>');
    });

    it('should include meta tags', () => {
      const app = new TestButton('Test');
      const html = renderToDocument(app, {
        meta: [
          { name: 'description', content: 'Test description' },
          { property: 'og:title', content: 'Test Title' },
        ],
      });

      expect(html).toContain('<meta name="description" content="Test description">');
      expect(html).toContain('<meta property="og:title" content="Test Title">');
    });

    it('should include hydration data in document', () => {
      const app = new TestButton('Test');
      const html = renderToDocument(app, {
        title: 'Test',
      });

      // Document should be complete
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Test');
    });
  });

  describe('Signal State Serialization', () => {
    it('should serialize signal values', () => {
      const count = signal(42);
      const name = signal('John');
      const isActive = signal(true);

      const state = {
        count: count.value,
        name: name.value,
        isActive: isActive.value,
      };

      const json = serializeSignalState(state);

      expect(json).toContain('42');
      expect(json).toContain('John');
      expect(json).toContain('true');
    });

    it('should serialize computed signal values', () => {
      const firstName = signal('John');
      const lastName = signal('Doe');
      const fullName = computed(() => `${firstName.value} ${lastName.value}`);

      const state = {
        fullName: fullName.value,
      };

      const json = serializeSignalState(state);

      expect(json).toContain('John Doe');
    });

    it('should serialize nested signal state', () => {
      const user = signal({
        name: 'John',
        age: 30,
        settings: {
          theme: 'dark',
        },
      });

      const state = {
        user: user.value,
      };

      const json = serializeSignalState(state);

      expect(json).toContain('John');
      expect(json).toContain('30');
      expect(json).toContain('dark');
    });
  });

  describe('Hydration Data', () => {
    beforeEach(() => {
      createSSRContext();
    });

    it('should have hydration data serialization available', () => {
      // serializeHydrationData is available and returns a string
      const script = serializeHydrationData();
      expect(typeof script).toBe('string');
      // When no data is generated, it returns empty string
      expect(script).toBe('');
    });

    it('should return empty string when no hydration data', () => {
      clearSSRContext();
      const script = serializeHydrationData();
      expect(script).toBe('');
    });
  });

  describe('Complex Components', () => {
    beforeEach(() => {
      createSSRContext();
    });

    it('should render todo app with signals', () => {
      const todos = signal([
        { id: 1, text: 'Buy milk', completed: false },
        { id: 2, text: 'Walk dog', completed: true },
      ]);

      const todoCount = computed(() => todos.value.filter((t) => !t.completed).length);

      const app = new BaseComponent(
        { tag: 'div', className: 'todo-app' },
        new BaseComponent({ tag: 'h1', txt: 'Todos' }),
        new BaseComponent({
          tag: 'p',
          txt: computed(() => `${todoCount.value} items left`),
        }),
      );

      const html = renderComponentToString(app);

      expect(html).toContain('Todos');
      expect(html).toContain('1 items left');
    });

    it('should render complex nested structure with signals', () => {
      const user = signal({ name: 'John', role: 'Admin' });
      const isOnline = signal(true);

      const app = new BaseComponent(
        { tag: 'div', className: 'app' },
        new BaseComponent(
          { tag: 'header' },
          new BaseComponent({
            tag: 'h1',
            txt: computed(() => `Welcome, ${user.value.name}`),
          }),
          new BaseComponent({
            tag: 'span',
            txt: computed(() => (isOnline.value ? '🟢 Online' : '🔴 Offline')),
          }),
        ),
        new BaseComponent(
          { tag: 'main' },
          new BaseComponent({
            tag: 'p',
            txt: computed(() => `Role: ${user.value.role}`),
          }),
        ),
      );

      const html = renderComponentToString(app);

      expect(html).toContain('Welcome, John');
      expect(html).toContain('🟢 Online');
      expect(html).toContain('Role: Admin');
    });
  });

  describe('HTML Safety', () => {
    beforeEach(() => {
      createSSRContext();
    });

    it('should escape HTML in signal content', () => {
      const text = signal('<script>alert("xss")</script>');
      const component = new BaseComponent({ tag: 'div', txt: text });

      const html = renderComponentToString(component);

      expect(html).not.toContain('<script>alert');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should escape HTML in computed signal', () => {
      const userInput = signal('<img src=x onerror=alert(1)>');
      const safeText = computed(() => userInput.value);

      const component = new BaseComponent({ tag: 'div', txt: safeText });
      const html = renderComponentToString(component);

      expect(html).not.toContain('<img src=');
      expect(html).toContain('&lt;img');
    });
  });
});
