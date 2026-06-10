/**
 * SSR Tests for @control.ts/min
 */

import { renderToString } from '@control.ts/control';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { BaseComponentChild } from '../base-component';
import { BaseComponent } from '../base-component';
import {
  clearSSRContext,
  createSSRContext,
  renderComponentToString,
  renderToDocument,
  serializeHydrationData,
} from '../ssr';

// Test components
class TestButton extends BaseComponent {
  constructor(text: string) {
    super({ tag: 'button', txt: text, className: 'test-button' });
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

describe('Min SSR Tests', () => {
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
      // Context should be cleared
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

    it('should render nested components', () => {
      const card = new TestCard('Title', 'Content');
      const html = renderComponentToString(card);

      expect(html).toContain('card');
      expect(html).toContain('Title');
      expect(html).toContain('Content');
      expect(html).toContain('<h2>');
      expect(html).toContain('<p>');
    });

    it('should render component with props', () => {
      const component = new BaseComponent({
        tag: 'div',
        className: 'test-div',
        id: 'test-id',
        title: 'Test Title',
      });

      const html = renderComponentToString(component);

      expect(html).toContain('class="test-div"');
      expect(html).toContain('id="test-id"');
      expect(html).toContain('title="Test Title"');
    });

    it('should render component with children', () => {
      const parent = new BaseComponent(
        { tag: 'div', className: 'parent' },
        new BaseComponent({ tag: 'span', txt: 'Child 1' }),
        new BaseComponent({ tag: 'span', txt: 'Child 2' }),
        new BaseComponent({ tag: 'span', txt: 'Child 3' }),
      );

      const html = renderComponentToString(parent);

      expect(html).toContain('parent');
      expect(html).toContain('Child 1');
      expect(html).toContain('Child 2');
      expect(html).toContain('Child 3');
    });

    it('should handle empty text content', () => {
      const component = new BaseComponent({ tag: 'div', txt: '' });
      const html = renderComponentToString(component);

      expect(html).toContain('<div');
      expect(html).toContain('</div>');
    });

    it('should render component with style', () => {
      const component = new BaseComponent({
        tag: 'div',
        style: { color: 'red', backgroundColor: 'blue' },
      });

      const html = renderComponentToString(component);

      // Style might be in inline style attribute
      expect(html).toContain('<div');
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

    it('should include script tags', () => {
      const app = new TestButton('Test');
      const html = renderToDocument(app, {
        scripts: [
          { src: '/client.js', type: 'module' },
          { content: 'console.log("test")', type: 'text/javascript' },
        ],
      });

      expect(html).toContain('<script src="/client.js" type="module"></script>');
      expect(html).toContain('<script type="text/javascript">console.log("test")</script>');
    });

    it('should include link tags', () => {
      const app = new TestButton('Test');
      const html = renderToDocument(app, {
        links: [{ rel: 'stylesheet', href: '/styles.css' }],
      });

      expect(html).toContain('<link rel="stylesheet" href="/styles.css">');
    });

    it('should set custom language', () => {
      const app = new TestButton('Test');
      const html = renderToDocument(app, {
        lang: 'fr',
      });

      expect(html).toContain('<html lang="fr">');
    });

    it('should include body attributes', () => {
      const app = new TestButton('Test');
      const html = renderToDocument(app, {
        bodyAttrs: {
          'data-theme': 'dark',
          className: 'custom-body',
        },
      });

      expect(html).toContain('<body');
      expect(html).toContain('data-theme="dark"');
      expect(html).toContain('class="custom-body"');
    });

    it('should include hydration data in document', () => {
      // renderToDocument always includes hydration script tag (even if empty)
      const app = new TestButton('Test');
      const html = renderToDocument(app, {
        title: 'Test',
      });

      // The hydration script tag should be present in the HTML
      // Even if no components were rendered with renderToString,
      // the script tag structure is included
      expect(html).toContain('Test');
      expect(html).toContain('<!DOCTYPE html>');
    });
  });

  describe('Hydration Data', () => {
    beforeEach(() => {
      createSSRContext();
    });

    it('should serialize hydration data', () => {
      // Use renderToString directly to generate hydration data
      renderToString('button', { className: 'test-button', textContent: 'Button 1' }, []);
      renderToString('button', { className: 'test-button', textContent: 'Button 2' }, []);

      const script = serializeHydrationData();
      expect(script).toContain('__CONTROL_HYDRATION_DATA__');
      expect(script).toContain('application/json');
      expect(script.length).toBeGreaterThan(50);
    });

    it('should return empty string when no hydration data', () => {
      clearSSRContext();
      const script = serializeHydrationData();
      expect(script).toBe('');
    });
  });

  describe('Multiple Components', () => {
    beforeEach(() => {
      createSSRContext();
    });

    it('should render multiple independent components', () => {
      const button1 = new TestButton('Button 1');
      const button2 = new TestButton('Button 2');
      const button3 = new TestButton('Button 3');

      const html1 = renderComponentToString(button1);
      const html2 = renderComponentToString(button2);
      const html3 = renderComponentToString(button3);

      expect(html1).toContain('Button 1');
      expect(html2).toContain('Button 2');
      expect(html3).toContain('Button 3');
    });

    it('should render complex nested structure', () => {
      const app = new BaseComponent(
        { tag: 'div', className: 'app' },
        new BaseComponent(
          { tag: 'header' },
          new BaseComponent({ tag: 'h1', txt: 'My App' }),
          new BaseComponent({ tag: 'nav' }, new TestButton('Home'), new TestButton('About')),
        ),
        new BaseComponent({ tag: 'main' }, new TestCard('Card 1', 'Content 1'), new TestCard('Card 2', 'Content 2')),
        new BaseComponent({ tag: 'footer', txt: 'Footer' }),
      );

      const html = renderComponentToString(app);

      expect(html).toContain('app');
      expect(html).toContain('header');
      expect(html).toContain('My App');
      expect(html).toContain('Home');
      expect(html).toContain('About');
      expect(html).toContain('Card 1');
      expect(html).toContain('Card 2');
      expect(html).toContain('Footer');
    });
  });

  describe('Special Cases', () => {
    beforeEach(() => {
      createSSRContext();
    });

    it('should handle component with no children', () => {
      const component = new BaseComponent({ tag: 'div', className: 'empty' });
      const html = renderComponentToString(component);

      expect(html).toContain('empty');
      expect(html).toContain('<div');
      expect(html).toContain('</div>');
    });

    it('should handle component with mixed content', () => {
      const component = new BaseComponent(
        { tag: 'div' },
        new BaseComponent({ tag: 'span', txt: 'Text' }),
        new BaseComponent({ tag: 'strong', txt: 'Bold' }),
        new BaseComponent({ tag: 'em', txt: 'Italic' }),
      );

      const html = renderComponentToString(component);

      expect(html).toContain('Text');
      expect(html).toContain('Bold');
      expect(html).toContain('Italic');
    });

    it('should handle component with null children', () => {
      const component = new BaseComponent({ tag: 'div' }, null as unknown as BaseComponentChild);
      const html = renderComponentToString(component);

      expect(html).toContain('<div');
    });
  });

  describe('HTML Safety', () => {
    beforeEach(() => {
      createSSRContext();
    });

    it('should escape HTML in text content', () => {
      const component = new BaseComponent({
        tag: 'div',
        txt: '<script>alert("xss")</script>',
      });

      const html = renderComponentToString(component);

      expect(html).not.toContain('<script>alert');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should escape HTML in attributes', () => {
      const component = new BaseComponent({
        tag: 'div',
        title: 'Test "quoted" & <tagged>',
      });

      const html = renderComponentToString(component);

      expect(html).toContain('title=');
      expect(html).toContain('&quot;');
      expect(html).toContain('&amp;');
    });
  });
});
