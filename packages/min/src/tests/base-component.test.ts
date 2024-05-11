import { describe, expect, it, vi } from 'vitest';

import { BaseComponent } from '../base-component';

class TestComponent extends BaseComponent {
  public get _children() {
    return [...this.node.children];
  }

  public get _subscriptions() {
    return this.subscriptions;
  }
}

describe('BaseComponent', () => {
  it('should create a new instance of BaseComponent with given props and children', () => {
    const child1 = document.createElement('span');
    const child2 = new BaseComponent({});
    const component = new BaseComponent({ txt: 'Hello', tag: 'div', className: 'component' }, child1, child2);

    expect(component.node.tagName).toBe('DIV');
    expect(component.node.textContent).toBe('Hello');
    expect(component.node.children).toContain(child1);
    expect(component.node.className).toBe('component');
  });

  it('should create a new instance of BaseComponent with a given tag and apply props and style', () => {
    const props = {
      tag: 'div' as const,
      txt: 'Hello World',
      style: {
        color: 'red',
        fontSize: '16px',
      },
    };
    const component = new BaseComponent(props);

    expect(component.node.tagName).toBe('DIV');
    expect(component.node.textContent).toBe('Hello World');
    expect(component.node.style.color).toBe('red');
    expect(component.node.style.fontSize).toBe('16px');
  });

  it("should create a new instance of BaseComponent with default tag 'div' if no tag is provided", () => {
    const component = new BaseComponent({});

    expect(component.node.tagName).toBe('DIV');
  });

  it('should append a child to the component', () => {
    const parent = new TestComponent({});
    const child = new BaseComponent({});

    parent.append(child);

    expect(parent._children.length).toBe(1);
    expect(parent.node.children.length).toBe(1);
    expect(parent.node.children[0]).toBe(child.node);
  });

  it('should append multiple children to the component', () => {
    const parent = new TestComponent({});
    const child1 = new BaseComponent({});
    const child2 = new BaseComponent({});

    parent.appendChildren([child1, child2]);

    expect(parent._children.length).toBe(2);
    expect(parent.node.children.length).toBe(2);
    expect(parent.node.children[0]).toBe(child1.node);
    expect(parent.node.children[1]).toBe(child2.node);
  });

  it('should remove a child from the component', () => {
    const parent = new TestComponent({});
    const child = new BaseComponent({});

    parent.append(child);
    parent.removeChild(child);

    expect(parent._children.length).toBe(0);
    expect(parent.node.children.length).toBe(0);
  });

  it('should set the text content of the component', () => {
    const component = new BaseComponent({
      txt: 'Hello World',
    });

    expect(component.node.textContent).toBe('Hello World');

    component.setTextContent('New Text');

    expect(component.node.textContent).toBe('New Text');
  });

  it('should add a class to the component', () => {
    const component = new BaseComponent({});

    expect(component.node.classList.contains('test-class')).toBe(false);

    component.addClass('test-class');

    expect(component.node.classList.contains('test-class')).toBe(true);
  });

  it('should toggle a class on the component', () => {
    const component = new BaseComponent({});

    component.toggleClass('test-class');

    expect(component.node.classList.contains('test-class')).toBe(true);

    component.toggleClass('test-class');

    expect(component.node.classList.contains('test-class')).toBe(false);

    component.toggleClass('test-class', true);

    component.toggleClass('test-class', true);

    expect(component.node.classList.contains('test-class')).toBe(true);

    component.toggleClass('test-class', false);

    component.toggleClass('test-class', false);

    expect(component.node.classList.contains('test-class')).toBe(false);
  });

  it('should remove a class from the component', () => {
    const component = new BaseComponent({});

    component.addClass('test-class');
    component.removeClass('test-class');

    expect(component.node.classList.contains('test-class')).toBe(false);
  });

  it('should not append null children to node', () => {
    const props = { txt: 'Hello' };
    const child1 = document.createElement('span');
    const child2 = null;
    const component = new BaseComponent(props, child1, child2);

    expect(component.node.children).toContain(child1);
    expect(component.node.children).not.toContain(child2);
  });

  it('should not append null BaseComponent children to node and children array', () => {
    const props = { txt: 'Hello' };
    const child1 = document.createElement('span');
    const child2 = new BaseComponent({});
    const child3 = null;
    const component = new BaseComponent(props, child1, child2, child3);

    expect(component.node.children).toContain(child1);
    expect(component.node.children).not.toContain(child2);
    expect(component.node.children).not.toContain(child3);
  });

  it('should not append null or undefined children when calling appendChildren method', () => {
    const child1 = document.createElement('span');
    const child2 = null;
    const component = new BaseComponent({ txt: 'Hello', tag: 'div' });

    component.appendChildren([child1, child2]);

    expect(component.node.children).toContain(child1);
    expect(component.node.children).not.toContain(child2);
  });

  it('should destroy the component and its children', () => {
    const parent = new BaseComponent({});
    const child = new BaseComponent({});

    parent.append(child);
    parent.destroy();

    expect(parent.node.parentElement).toBeNull();
    expect(child.node.parentElement).toBeNull();
  });
});

describe('Subscriptions testing integration', () => {
  class TestComponent2 extends TestComponent {
    public override destroy(): void {
      super.destroy();
      console.log('destroyed', Date.now());
    }
  }

  it('should subscribe to a signal', () => {
    const component = new TestComponent2({
      txt: 'Hello World',
    });

    component.subscribe(() => {});
    component.subscribe(() => {
      console.log('Hello', Date.now());
    });

    expect(component._subscriptions.length).toBe(2);
  });

  it('should unsubscribe from all signals', () => {
    const mock = vi.fn().mockReturnValue(undefined);

    const component = new TestComponent({});

    component.subscribe(() => {});
    component.subscribe(mock);

    expect(component._subscriptions.length).toBe(2);

    component.unsubscribeAll();

    expect(component._subscriptions.length).toBe(0);
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it('should remove all subscriptions after replacing element', async () => {
    const mock = vi.fn().mockReturnValue(undefined);
    const firstChild = new TestComponent({ textContent: 'Hello', className: 'first' });
    firstChild.subscribe(mock);
    firstChild.subscribe(() => {
      console.log('Hello', Date.now());
    });

    const emptyChild = new TestComponent({ textContent: 'EMPTY', className: 'empty' });
    const component = new TestComponent({}, firstChild);

    expect(component.node.children.item(0)?.textContent).toBe('Hello');

    expect(firstChild._subscriptions.length).toBe(2);

    component.destroyChild(firstChild);

    component.append(emptyChild);

    expect(component.node.children.item(0)?.textContent).toBe('EMPTY');

    expect(component._subscriptions.length).toBe(0);

    component.destroy();
    expect(component._children.length).toBe(0);

    expect(component._subscriptions.length).toBe(0);
    expect(firstChild._subscriptions.length).toBe(0);

    expect(mock).toHaveBeenCalledTimes(1);
  });
});
