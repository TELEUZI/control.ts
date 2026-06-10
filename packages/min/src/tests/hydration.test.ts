/**
 * Hydration Tests for @control.ts/min
 */

import { renderToString } from '@control.ts/control';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BaseComponent } from '../base-component';
import { clearHydrationData, hydrateComponent, isHydrationAvailable, mountWithHydration } from '../hydrate';
import { clearSSRContext, createSSRContext, serializeHydrationData } from '../ssr';

// Test components
class ButtonComponent extends BaseComponent {
  constructor(text: string, onClick?: () => void) {
    super({ tag: 'button', txt: text, className: 'test-button' });

    if (typeof document !== 'undefined' && onClick) {
      this.node.onclick = onClick;
    }
  }
}

class CounterComponent extends BaseComponent {
  private count = 0;

  constructor(initialCount = 0) {
    super({ tag: 'div', className: 'counter' });
    this.count = initialCount;

    if (typeof document !== 'undefined') {
      this.render();
    }
  }

  private render() {
    const display = new BaseComponent({ tag: 'span', txt: `Count: ${this.count}`, className: 'count-display' });
    const button = new ButtonComponent('Increment', () => this.increment());

    this.appendChildren([display, button]);
  }

  private increment() {
    this.count++;
    const display = this.node.querySelector('.count-display');
    if (display) {
      display.textContent = `Count: ${this.count}`;
    }
  }

  public getCount() {
    return this.count;
  }
}

describe('Min Hydration Tests', () => {
  beforeEach(() => {
    clearHydrationData();
  });

  afterEach(() => {
    clearSSRContext();
    clearHydrationData();
  });

  describe('Basic Hydration', () => {
    it('should detect hydration availability', () => {
      expect(isHydrationAvailable()).toBe(false);

      // Add hydration script
      const script = document.createElement('script');
      script.id = '__CONTROL_HYDRATION_DATA__';
      script.type = 'application/json';
      script.textContent = '{}';
      document.body.appendChild(script);

      expect(isHydrationAvailable()).toBe(true);

      document.body.removeChild(script);
    });

    it('should hydrate a simple component', () => {
      createSSRContext();
      renderToString('button', { className: 'test-button', textContent: 'Click Me' }, []);

      const hydrationScript = serializeHydrationData();
      clearSSRContext();

      const scriptElement = document.createElement('script');
      scriptElement.id = '__CONTROL_HYDRATION_DATA__';
      scriptElement.type = 'application/json';
      const jsonMatch = hydrationScript.match(/>(.*?)<\/script>/);
      scriptElement.textContent = jsonMatch ? jsonMatch[1] || '' : '{}';
      document.body.appendChild(scriptElement);

      const button = new ButtonComponent('Click Me');
      hydrateComponent(button);

      expect(button.node.textContent).toBe('Click Me');
      expect(button.node.className).toContain('test-button');

      document.body.removeChild(scriptElement);
    });
  });

  describe('mountWithHydration', () => {
    it('should mount component with hydration support', () => {
      const root = document.createElement('div');
      root.id = 'app';
      document.body.appendChild(root);

      const clickHandler = vi.fn();
      mountWithHydration(root, () => new ButtonComponent('Test Button', clickHandler));

      const button = root.querySelector('button');
      expect(button).toBeTruthy();
      expect(button?.textContent).toBe('Test Button');

      button?.click();
      expect(clickHandler).toHaveBeenCalled();

      document.body.removeChild(root);
    });

    it('should work without hydration data (client render)', () => {
      const root = document.createElement('div');
      root.id = 'app';
      document.body.appendChild(root);

      const clickHandler = vi.fn();
      mountWithHydration(root, () => new ButtonComponent('Client Only', clickHandler));

      const button = root.querySelector('button');
      expect(button).toBeTruthy();
      expect(button?.textContent).toBe('Client Only');

      button?.click();
      expect(clickHandler).toHaveBeenCalled();

      document.body.removeChild(root);
    });

    it('should hydrate with function component', () => {
      const root = document.createElement('div');
      root.id = 'app';
      document.body.appendChild(root);

      let clickCount = 0;
      const createApp = () => new ButtonComponent('Function Component', () => clickCount++);

      mountWithHydration(root, createApp);

      const button = root.querySelector('button');
      expect(button).toBeTruthy();

      button?.click();
      expect(clickCount).toBe(1);

      document.body.removeChild(root);
    });
  });

  describe('Nested Components', () => {
    it('should hydrate nested components', () => {
      createSSRContext();
      renderToString('div', { className: 'counter' }, []);

      const hydrationScript = serializeHydrationData();
      clearSSRContext();

      const scriptElement = document.createElement('script');
      scriptElement.id = '__CONTROL_HYDRATION_DATA__';
      scriptElement.type = 'application/json';
      const jsonMatch = hydrationScript.match(/>(.*?)<\/script>/);
      scriptElement.textContent = jsonMatch ? jsonMatch[1] || '' : '{}';
      document.body.appendChild(scriptElement);

      const counter = new CounterComponent(0);
      hydrateComponent(counter);

      expect(counter.node.querySelector('.count-display')).toBeTruthy();
      expect(counter.node.querySelector('button')).toBeTruthy();

      document.body.removeChild(scriptElement);
    });
  });

  describe('Event Handlers', () => {
    it('should preserve event handlers after hydration', () => {
      const root = document.createElement('div');
      root.id = 'app';
      document.body.appendChild(root);

      const clickHandler = vi.fn();
      mountWithHydration(root, () => new ButtonComponent('Click Me', clickHandler));

      const button = root.querySelector('button');
      expect(button).toBeTruthy();

      button?.click();
      expect(clickHandler).toHaveBeenCalledTimes(1);

      button?.click();
      expect(clickHandler).toHaveBeenCalledTimes(2);

      document.body.removeChild(root);
    });
  });

  describe('Multiple Components', () => {
    it('should hydrate multiple independent components', () => {
      const root = document.createElement('div');
      root.id = 'app';
      document.body.appendChild(root);

      const handler1 = vi.fn();
      const handler2 = vi.fn();

      const app = new BaseComponent(
        { tag: 'div' },
        new ButtonComponent('Button 1', handler1),
        new ButtonComponent('Button 2', handler2),
      );

      mountWithHydration(root, () => app);

      const buttons = root.querySelectorAll('button');
      expect(buttons.length).toBe(2);

      buttons[0]?.click();
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).not.toHaveBeenCalled();

      buttons[1]?.click();
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler1).toHaveBeenCalledTimes(1);

      document.body.removeChild(root);
    });
  });

  describe('Clear Hydration Data', () => {
    it('should clear hydration data', () => {
      const script = document.createElement('script');
      script.id = '__CONTROL_HYDRATION_DATA__';
      script.type = 'application/json';
      script.textContent = '{"0": {}}';
      document.body.appendChild(script);

      expect(isHydrationAvailable()).toBe(true);

      clearHydrationData();

      expect(isHydrationAvailable()).toBe(false);
    });
  });
});
