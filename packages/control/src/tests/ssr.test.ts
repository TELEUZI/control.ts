/**
 * SSR Tests for Control.ts
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Control } from '../control';
import {
  clearSSRContext,
  createSSRContext,
  getSSRContext,
  isServerEnvironment,
  renderControlToString,
  renderToDocument,
  renderToString,
  serializeHydrationData,
} from '../ssr';

// Test component
class TestComponent extends Control<HTMLDivElement> {
  protected _node: HTMLDivElement;
  protected children: Control[] = [];

  constructor(text: string = 'Test') {
    super();

    if (typeof document !== 'undefined') {
      this._node = document.createElement('div');
      this._node.className = 'test-component';
      this._node.textContent = text;
    } else {
      this._node = { className: 'test-component', textContent: text } as HTMLDivElement;
    }
  }
}

describe('SSR Core Functions', () => {
  afterEach(() => {
    clearSSRContext();
  });

  it('should detect server environment', () => {
    // In vitest with jsdom, this should be false
    const isServer = isServerEnvironment();
    expect(typeof isServer).toBe('boolean');
  });

  it('should create SSR context', () => {
    const ctx = createSSRContext();
    expect(ctx).toBeDefined();
    expect(ctx.isServer).toBe(true);
    expect(ctx.componentId).toBe(0);
    expect(ctx.hydrationData).toBeInstanceOf(Map);
  });

  it('should get SSR context', () => {
    createSSRContext();
    const ctx = getSSRContext();
    expect(ctx).toBeDefined();
    expect(ctx?.isServer).toBe(true);
  });

  it('should clear SSR context', () => {
    createSSRContext();
    expect(getSSRContext()).toBeDefined();
    clearSSRContext();
    expect(getSSRContext()).toBeNull();
  });
});

describe('renderToString', () => {
  beforeEach(() => {
    createSSRContext();
  });

  afterEach(() => {
    clearSSRContext();
  });

  it('should render simple element', () => {
    const html = renderToString('div', { className: 'test' }, []);
    expect(html).toContain('<div');
    expect(html).toContain('class="test"');
    expect(html).toContain('</div>');
  });

  it('should render element with text content', () => {
    const html = renderToString('p', { txt: 'Hello World' }, []);
    expect(html).toContain('<p');
    expect(html).toContain('Hello World');
    expect(html).toContain('</p>');
  });

  it('should render element with styles', () => {
    const html = renderToString(
      'div',
      {
        style: {
          color: 'red',
          backgroundColor: 'blue',
        },
      },
      [],
    );
    expect(html).toContain('style=');
    expect(html).toContain('color:red');
    expect(html).toContain('background-color:blue');
  });

  it('should escape HTML in text content', () => {
    const html = renderToString('div', { txt: '<script>alert("xss")</script>' }, []);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('should render void elements without closing tag', () => {
    const html = renderToString('img', { src: '/test.jpg', alt: 'Test' }, []);
    expect(html).toContain('<img');
    expect(html).not.toContain('</img>');
  });

  it('should add hydration data attribute', () => {
    const html = renderToString('div', {}, []);
    expect(html).toContain('data-hydrate=');
  });
});

describe('renderControlToString', () => {
  it('should render Control component', () => {
    const component = new TestComponent('Hello SSR');
    const html = renderControlToString(component);
    expect(html).toContain('test-component');
    expect(html).toContain('Hello SSR');
  });
});

describe('renderToDocument', () => {
  it('should render complete HTML document', () => {
    const component = new TestComponent('Test');
    const html = renderToDocument(component, {
      title: 'Test Page',
    });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html');
    expect(html).toContain('<head>');
    expect(html).toContain('<title>Test Page</title>');
    expect(html).toContain('<body>');
    expect(html).toContain('</html>');
  });

  it('should include meta tags', () => {
    const component = new TestComponent();
    const html = renderToDocument(component, {
      meta: [
        { name: 'description', content: 'Test description' },
        { property: 'og:title', content: 'Test Title' },
      ],
    });

    expect(html).toContain('<meta name="description" content="Test description">');
    expect(html).toContain('<meta property="og:title" content="Test Title">');
  });

  it('should include link tags', () => {
    const component = new TestComponent();
    const html = renderToDocument(component, {
      links: [
        { rel: 'stylesheet', href: '/styles.css' },
        { rel: 'icon', href: '/favicon.ico' },
      ],
    });

    expect(html).toContain('<link rel="stylesheet" href="/styles.css">');
    expect(html).toContain('<link rel="icon" href="/favicon.ico">');
  });

  it('should include script tags', () => {
    const component = new TestComponent();
    const html = renderToDocument(component, {
      scripts: [
        { src: '/client.js', type: 'module' },
        { content: 'console.log("inline")', type: 'text/javascript' },
      ],
    });

    expect(html).toContain('<script src="/client.js" type="module"></script>');
    expect(html).toContain('<script type="text/javascript">console.log("inline")</script>');
  });

  it('should set custom language', () => {
    const component = new TestComponent();
    const html = renderToDocument(component, {
      lang: 'fr',
    });

    expect(html).toContain('<html lang="fr">');
  });

  it('should include body attributes', () => {
    const component = new TestComponent();
    const html = renderToDocument(component, {
      bodyAttrs: {
        'data-theme': 'dark',
        className: 'custom-body',
      },
    });

    expect(html).toContain('<body');
    expect(html).toContain('data-theme="dark"');
    expect(html).toContain('class="custom-body"');
  });

  it('should include hydration script', () => {
    createSSRContext();
    // Render some elements to generate hydration data
    renderToString('div', { className: 'test' }, []);
    renderToString('p', { txt: 'Hello' }, []);

    const hydrationScript = serializeHydrationData();
    expect(hydrationScript).toContain('__CONTROL_HYDRATION_DATA__');
    expect(hydrationScript).toContain('type="application/json"');

    clearSSRContext();
  });

  it('should clear SSR context after rendering', () => {
    const component = new TestComponent();
    renderToDocument(component);

    // Context should be cleared automatically
    expect(getSSRContext()).toBeNull();
  });
});

describe('Hydration Data', () => {
  beforeEach(() => {
    createSSRContext();
  });

  afterEach(() => {
    clearSSRContext();
  });

  it('should serialize hydration data', () => {
    renderToString('div', { className: 'test' }, []);
    renderToString('p', { txt: 'Hello' }, []);

    const script = serializeHydrationData();
    expect(script).toContain('__CONTROL_HYDRATION_DATA__');
    expect(script).toContain('application/json');

    // Should contain component data
    expect(script.length).toBeGreaterThan(100);
  });

  it('should return empty string when no hydration data', () => {
    clearSSRContext();
    const script = serializeHydrationData();
    expect(script).toBe('');
  });
});

describe('HTML Escaping', () => {
  beforeEach(() => {
    createSSRContext();
  });

  afterEach(() => {
    clearSSRContext();
  });

  it('should escape special characters in text', () => {
    const html = renderToString(
      'div',
      {
        txt: '<>&"\'',
      },
      [],
    );

    expect(html).toContain('&lt;');
    expect(html).toContain('&gt;');
    expect(html).toContain('&amp;');
    expect(html).toContain('&quot;');
    expect(html).toContain('&#39;');
  });

  it('should escape attributes', () => {
    const html = renderToString(
      'div',
      {
        title: 'Test "quoted" & <tagged>',
      },
      [],
    );

    expect(html).toContain('title=');
    expect(html).toContain('&quot;');
    expect(html).toContain('&amp;');
    expect(html).toContain('&lt;');
  });
});

describe('Nested Components', () => {
  class ParentComponent extends Control<HTMLDivElement> {
    protected _node: HTMLDivElement;
    protected children: Control[] = [];

    constructor() {
      super();

      if (typeof document !== 'undefined') {
        this._node = document.createElement('div');
        this._node.className = 'parent';

        const child1 = new TestComponent('Child 1');
        const child2 = new TestComponent('Child 2');

        this.children.push(child1, child2);
        this._node.append(child1.node, child2.node);
      } else {
        this._node = { className: 'parent' } as HTMLDivElement;
      }
    }
  }

  it('should render nested components', () => {
    const parent = new ParentComponent();
    const html = renderControlToString(parent);

    expect(html).toContain('parent');
    expect(html).toContain('Child 1');
    expect(html).toContain('Child 2');
  });
});
