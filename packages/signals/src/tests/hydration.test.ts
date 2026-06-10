/**
 * Hydration Tests for @control.ts/signals
 */

import { renderToString } from '@control.ts/control';
import { computed, signal } from '@preact/signals-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BaseComponent } from '../base-component';
import { clearHydrationData, hydrate, isHydrationAvailable, loadSignalState, mountWithHydration } from '../hydrate';
import { clearSSRContext, createSSRContext, serializeHydrationData, serializeSignalState } from '../ssr';

// Test components
class ButtonComponent extends BaseComponent {
  constructor(text: string, onClick?: () => void) {
    super({ tag: 'button', txt: text, className: 'test-button' });

    if (typeof document !== 'undefined' && onClick) {
      this.node.onclick = onClick;
    }
  }
}

class ReactiveCounter extends BaseComponent {
  private count = signal(0);

  constructor(initialCount = 0) {
    super({ tag: 'div', className: 'counter' });
    this.count.value = initialCount;

    if (typeof document !== 'undefined') {
      this.render();
    }
  }

  private render() {
    const display = new BaseComponent({
      tag: 'span',
      txt: computed(() => `Count: ${this.count.value}`),
      className: 'count-display',
    });

    const button = new BaseComponent({
      tag: 'button',
      txt: '+',
      onclick: () => this.count.value++,
    });

    this.appendChildren([display, button]);
  }

  public getCount() {
    return this.count.value;
  }
}

describe('Signals Hydration Tests', () => {
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
      scriptElement.textContent = jsonMatch?.[1] ?? null;
      document.body.appendChild(scriptElement);

      const button = new ButtonComponent('Click Me');
      hydrate(document.body, button);

      expect(button.node.textContent).toBe('Click Me');
      expect(button.node.className).toContain('test-button');

      document.body.removeChild(scriptElement);
    });
  });

  describe('Signal State Management', () => {
    it('should load signal state from server', () => {
      const state = { count: 42, name: 'John', isActive: true };
      const serialized = serializeSignalState(state);

      const script = document.createElement('script');
      script.id = '__SIGNAL_STATE__';
      script.type = 'application/json';
      script.textContent = serialized;
      document.body.appendChild(script);

      const loaded = loadSignalState<typeof state>();

      expect(loaded).toBeDefined();
      expect(loaded?.count).toBe(42);
      expect(loaded?.name).toBe('John');
      expect(loaded?.isActive).toBe(true);

      document.body.removeChild(script);
    });

    it('should return null when no signal state', () => {
      const loaded = loadSignalState();
      expect(loaded).toBeNull();
    });

    it('should handle malformed signal state', () => {
      const script = document.createElement('script');
      script.id = '__SIGNAL_STATE__';
      script.type = 'application/json';
      script.textContent = 'invalid json {';
      document.body.appendChild(script);

      const loaded = loadSignalState();
      expect(loaded).toBeNull();

      document.body.removeChild(script);
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
  });

  describe('Reactive Components', () => {
    it('should hydrate reactive counter', () => {
      const root = document.createElement('div');
      root.id = 'app';
      document.body.appendChild(root);

      mountWithHydration(root, () => new ReactiveCounter(5));

      const display = root.querySelector('.count-display');
      expect(display).toBeTruthy();
      expect(display?.textContent).toContain('Count: 5');

      const button = root.querySelector('button');
      expect(button).toBeTruthy();

      document.body.removeChild(root);
    });

    it('should maintain reactivity after hydration', () => {
      const root = document.createElement('div');
      root.id = 'app';
      document.body.appendChild(root);

      const counter = new ReactiveCounter(0);
      mountWithHydration(root, () => counter);

      const button = root.querySelector('button');
      expect(button).toBeTruthy();

      // Click button - count should update reactively
      button?.click();

      // Need to wait a tick for signal updates
      setTimeout(() => {
        root.querySelector('.count-display');
        expect(counter.getCount()).toBe(1);
      }, 0);

      document.body.removeChild(root);
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

  describe('Signal Hydration Workflow', () => {
    it('should complete full SSR → Hydration cycle with signals', () => {
      // Server side
      createSSRContext();

      const count = signal(42);
      const state = { count: count.value };
      const stateJson = serializeSignalState(state);

      renderToString('div', { className: 'counter' }, []);
      const hydrationScript = serializeHydrationData();

      clearSSRContext();

      // Client side
      const hydrationScriptEl = document.createElement('script');
      hydrationScriptEl.id = '__CONTROL_HYDRATION_DATA__';
      hydrationScriptEl.type = 'application/json';
      const jsonMatch = hydrationScript.match(/>(.*?)<\/script>/);
      hydrationScriptEl.textContent = jsonMatch?.[1] ?? null;
      document.body.appendChild(hydrationScriptEl);

      const stateScriptEl = document.createElement('script');
      stateScriptEl.id = '__SIGNAL_STATE__';
      stateScriptEl.type = 'application/json';
      stateScriptEl.textContent = stateJson;
      document.body.appendChild(stateScriptEl);

      // Load state and create component
      const loadedState = loadSignalState<typeof state>();
      expect(loadedState?.count).toBe(42);

      const root = document.createElement('div');
      root.id = 'app';
      document.body.appendChild(root);

      mountWithHydration(root, () => new ReactiveCounter(loadedState?.count || 0));

      const display = root.querySelector('.count-display');
      expect(display?.textContent).toContain('Count: 42');

      // Cleanup
      document.body.removeChild(root);
      document.body.removeChild(hydrationScriptEl);
      document.body.removeChild(stateScriptEl);
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
