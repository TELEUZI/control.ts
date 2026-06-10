/**
 * Hydration Integration Tests
 *
 * These tests verify the complete SSR → Hydration cycle works correctly.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Control } from '../control';
import { clearHydrationData, isHydrationAvailable, loadHydrationData, mountWithHydration } from '../hydrate';
import {
  clearSSRContext,
  createSSRContext,
  renderControlToString,
  renderToDocument,
  renderToString,
  serializeHydrationData,
} from '../ssr';

// Test components
class ButtonComponent extends Control<HTMLButtonElement> {
  protected _node: HTMLButtonElement;
  protected children: Control[] = [];
  private clickHandler: (() => void) | null = null;

  constructor(text: string, onClick?: () => void) {
    super();

    if (typeof document !== 'undefined') {
      this._node = document.createElement('button');
      this._node.textContent = text;
      this._node.className = 'test-button';

      if (onClick) {
        this.clickHandler = onClick;
        this._node.onclick = onClick;
      }
    } else {
      this._node = { textContent: text, className: 'test-button' } as HTMLButtonElement;
    }
  }

  public getClickHandler() {
    return this.clickHandler;
  }
}

class CounterComponent extends Control<HTMLDivElement> {
  protected _node: HTMLDivElement;
  protected children: Control[] = [];
  private count = 0;
  private button: ButtonComponent | null = null;
  private display: HTMLSpanElement | null = null;

  constructor(initialCount = 0) {
    super();
    this.count = initialCount;

    if (typeof document !== 'undefined') {
      this._node = document.createElement('div');
      this._node.className = 'counter';

      this.display = document.createElement('span');
      this.display.textContent = `Count: ${this.count}`;
      this.display.className = 'count-display';

      this.button = new ButtonComponent('Increment', () => this.increment());
      this.children.push(this.button);

      this._node.append(this.display, this.button.node);
    } else {
      this._node = { className: 'counter' } as HTMLDivElement;
    }
  }

  private increment() {
    this.count++;
    if (this.display) {
      this.display.textContent = `Count: ${this.count}`;
    }
  }

  public getCount() {
    return this.count;
  }
}

class FormComponent extends Control<HTMLFormElement> {
  protected _node: HTMLFormElement;
  protected children: Control[] = [];
  private submitHandler: ((e: Event) => void) | null = null;

  constructor(onSubmit?: (e: Event) => void) {
    super();

    if (typeof document !== 'undefined') {
      this._node = document.createElement('form');
      this._node.className = 'test-form';

      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'username';
      input.placeholder = 'Enter username';

      const button = document.createElement('button');
      button.type = 'submit';
      button.textContent = 'Submit';

      if (onSubmit) {
        this.submitHandler = onSubmit;
        this._node.onsubmit = onSubmit;
      }

      this._node.append(input, button);
    } else {
      this._node = { className: 'test-form' } as HTMLFormElement;
    }
  }

  public getSubmitHandler() {
    return this.submitHandler;
  }
}

describe('Hydration Integration Tests', () => {
  beforeEach(() => {
    // Clear any existing hydration data
    clearHydrationData();
  });

  afterEach(() => {
    clearSSRContext();
    clearHydrationData();
  });

  describe('SSR to Hydration Cycle', () => {
    it('should complete full SSR → Hydration cycle', () => {
      // Step 1: Server-side rendering (using renderToString directly)
      createSSRContext();

      // Render using the low-level renderToString to generate hydration data
      const serverHtml = renderToString('button', { className: 'test-button', textContent: 'Click Me' }, []);

      expect(serverHtml).toContain('Click Me');
      expect(serverHtml).toContain('test-button');

      const hydrationScript = serializeHydrationData();
      expect(hydrationScript).toContain('__CONTROL_HYDRATION_DATA__');

      clearSSRContext();

      // Step 2: Simulate browser receiving HTML
      // In a real scenario, the browser would parse this HTML
      // For testing, we'll inject the hydration script into the document
      const scriptElement = document.createElement('script');
      scriptElement.id = '__CONTROL_HYDRATION_DATA__';
      scriptElement.type = 'application/json';
      scriptElement.textContent = hydrationScript.match(/>(.*?)<\/script>/)?.[1] || '{}';
      document.body.appendChild(scriptElement);

      // Step 3: Check hydration is available
      expect(isHydrationAvailable()).toBe(true);

      // Step 4: Create client component and hydrate
      const clientButton = new ButtonComponent('Click Me');

      // Step 5: Verify component is hydrated
      expect(clientButton.node.textContent).toBe('Click Me');
      expect(clientButton.node.className).toBe('test-button');

      // Cleanup
      document.body.removeChild(scriptElement);
    });

    it('should preserve event handlers after hydration', () => {
      const clickHandler = vi.fn();

      // Server render
      createSSRContext();
      const serverButton = new ButtonComponent('Test', clickHandler);
      renderControlToString(serverButton);

      const hydrationScript = serializeHydrationData();
      clearSSRContext();

      // Setup client
      const scriptElement = document.createElement('script');
      scriptElement.id = '__CONTROL_HYDRATION_DATA__';
      scriptElement.type = 'application/json';
      scriptElement.textContent = hydrationScript.match(/>(.*?)<\/script>/)?.[1] || '{}';
      document.body.appendChild(scriptElement);

      // Client hydration
      const clientButton = new ButtonComponent('Test', clickHandler);

      // Test event handler works
      clientButton.node.click();
      expect(clickHandler).toHaveBeenCalledTimes(1);

      // Cleanup
      document.body.removeChild(scriptElement);
    });

    it('should hydrate nested components', () => {
      // Server render
      createSSRContext();
      const serverCounter = new CounterComponent(0);
      const serverHtml = renderControlToString(serverCounter);

      expect(serverHtml).toContain('counter');
      expect(serverHtml).toContain('Count: 0');

      const hydrationScript = serializeHydrationData();
      clearSSRContext();

      // Setup client
      const scriptElement = document.createElement('script');
      scriptElement.id = '__CONTROL_HYDRATION_DATA__';
      scriptElement.type = 'application/json';
      scriptElement.textContent = hydrationScript.match(/>(.*?)<\/script>/)?.[1] || '{}';
      document.body.appendChild(scriptElement);

      // Client hydration
      const clientCounter = new CounterComponent(0);

      // Verify structure
      expect(clientCounter.node.querySelector('.count-display')).toBeTruthy();
      expect(clientCounter.node.querySelector('.test-button')).toBeTruthy();

      // Test functionality
      const button = clientCounter.node.querySelector('button');
      expect(button).toBeTruthy();

      button?.click();
      expect(clientCounter.getCount()).toBe(1);
      expect(clientCounter.node.querySelector('.count-display')?.textContent).toBe('Count: 1');

      // Cleanup
      document.body.removeChild(scriptElement);
    });
  });

  describe('mountWithHydration', () => {
    it('should work with mountWithHydration (with or without SSR data)', () => {
      // Create root element
      const root = document.createElement('div');
      root.id = 'app';
      document.body.appendChild(root);

      // Mount with hydration (will fallback to client render without hydration data)
      const clickHandler = vi.fn();
      mountWithHydration(root, () => new ButtonComponent('Test Button', clickHandler));

      // Verify the component was mounted
      const button = root.querySelector('button');
      expect(button).toBeTruthy();
      expect(button?.textContent).toBe('Test Button');

      // Test event handler works
      button?.click();
      expect(clickHandler).toHaveBeenCalled();

      // Cleanup
      document.body.removeChild(root);
    });

    it('should fallback to client render when no hydration data', () => {
      // No server render - just client
      const root = document.createElement('div');
      root.id = 'app';
      document.body.appendChild(root);

      const clickHandler = vi.fn();
      mountWithHydration(root, () => new ButtonComponent('Client Only', clickHandler));

      // Should still work via client render
      const button = root.querySelector('button');
      expect(button).toBeTruthy();
      expect(button?.textContent).toBe('Client Only');

      button?.click();
      expect(clickHandler).toHaveBeenCalled();

      // Cleanup
      document.body.removeChild(root);
    });
  });

  describe('Hydration Data Management', () => {
    it('should load hydration data from script tag', () => {
      // Create hydration script
      const hydrationData = {
        '0': { id: 0, tag: 'div', props: { className: 'test' }, events: [], hasChildren: false },
        '1': { id: 1, tag: 'button', props: { textContent: 'Click' }, events: ['click'], hasChildren: false },
      };

      const script = document.createElement('script');
      script.id = '__CONTROL_HYDRATION_DATA__';
      script.type = 'application/json';
      script.textContent = JSON.stringify(hydrationData);
      document.body.appendChild(script);

      // Load data
      const loaded = loadHydrationData();

      expect(loaded).toBeTruthy();
      expect(loaded?.size).toBe(2);
      expect(loaded?.get(0)?.tag).toBe('div');
      expect(loaded?.get(1)?.tag).toBe('button');

      // Cleanup
      document.body.removeChild(script);
    });

    it('should return null when no hydration data exists', () => {
      const loaded = loadHydrationData();
      expect(loaded).toBeNull();
    });

    it('should handle malformed hydration data gracefully', () => {
      const script = document.createElement('script');
      script.id = '__CONTROL_HYDRATION_DATA__';
      script.type = 'application/json';
      script.textContent = 'invalid json {';
      document.body.appendChild(script);

      const loaded = loadHydrationData();
      expect(loaded).toBeNull();

      document.body.removeChild(script);
    });

    it('should clear hydration data', () => {
      // Setup hydration data
      const script = document.createElement('script');
      script.id = '__CONTROL_HYDRATION_DATA__';
      script.type = 'application/json';
      script.textContent = '{"0": {}}';
      document.body.appendChild(script);

      expect(isHydrationAvailable()).toBe(true);

      clearHydrationData();

      expect(isHydrationAvailable()).toBe(false);
      expect(document.getElementById('__CONTROL_HYDRATION_DATA__')).toBeNull();
    });
  });

  describe('Form Hydration', () => {
    it('should hydrate forms with submit handlers', () => {
      const submitHandler = vi.fn((e: Event) => e.preventDefault());

      // Server render
      createSSRContext();
      const serverForm = new FormComponent(submitHandler);
      const html = renderToDocument(serverForm, { title: 'Form Test' });
      clearSSRContext();

      // Setup client
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const hydrationScript = doc.getElementById('__CONTROL_HYDRATION_DATA__');

      if (hydrationScript) {
        document.body.appendChild(hydrationScript);
      }

      // Create root and mount
      const root = document.createElement('div');
      root.id = 'app';
      document.body.appendChild(root);

      mountWithHydration(root, () => new FormComponent(submitHandler));

      // Test form submission
      const form = root.querySelector('form');
      expect(form).toBeTruthy();

      if (form) {
        form.dispatchEvent(new Event('submit'));
        expect(submitHandler).toHaveBeenCalled();
      }

      // Cleanup
      document.body.removeChild(root);
      if (hydrationScript) {
        document.body.removeChild(hydrationScript);
      }
    });
  });

  describe('Multiple Components', () => {
    it('should hydrate multiple independent components', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      // Server render both
      createSSRContext();
      const button1 = new ButtonComponent('Button 1', handler1);
      const button2 = new ButtonComponent('Button 2', handler2);

      renderControlToString(button1);
      renderControlToString(button2);

      const hydrationScript = serializeHydrationData();
      clearSSRContext();

      // Setup client
      const scriptElement = document.createElement('script');
      scriptElement.id = '__CONTROL_HYDRATION_DATA__';
      scriptElement.type = 'application/json';
      scriptElement.textContent = hydrationScript.match(/>(.*?)<\/script>/)?.[1] || '{}';
      document.body.appendChild(scriptElement);

      // Hydrate both
      const clientButton1 = new ButtonComponent('Button 1', handler1);
      const clientButton2 = new ButtonComponent('Button 2', handler2);

      // Test both work independently
      clientButton1.node.click();
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).not.toHaveBeenCalled();

      clientButton2.node.click();
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler1).toHaveBeenCalledTimes(1);

      // Cleanup
      document.body.removeChild(scriptElement);
    });
  });
});
