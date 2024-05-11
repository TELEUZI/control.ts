import { describe, expect, it, vi } from 'vitest';

import { BaseComponent } from '../base-component';
import { $, $$ } from '../signals';

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
      tagName: 'div',
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

  it('should replace the component with a child', () => {
    const parent = new BaseComponent({});
    const child = new BaseComponent({});

    parent.replaceWith(child);

    expect(parent.node.parentElement).toBeNull();
    expect(child.node.parentElement).toBeNull();
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

describe('Signals integration', () => {
  it('should subscribe to a signal', () => {
    const txt = $('Hello World');
    const component = new TestComponent({
      txt,
    });

    component.subscribe(() => {});
    component.subscribe(() => {});

    expect(component._subscriptions.length).toBe(3);
  });

  it('should unsubscribe from all signals', () => {
    const txt = $('Hello World');
    const className = $('Value 2');
    const props = {
      txt,
      className,
    };
    const mock = vi.fn().mockReturnValue(undefined);

    const component = new TestComponent(props);

    component.subscribe(() => {});
    component.subscribe(mock);

    expect(component._subscriptions.length).toBe(4);

    component.unsubscribeAll();

    expect(component._subscriptions.length).toBe(0);
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it('should update the text content of the node when the txt prop is a Signal', () => {
    const txt = $('Hello');
    const component = new BaseComponent({ txt });

    expect(component.node.textContent).toBe('Hello');

    txt.value = 'World';

    expect(component.node.textContent).toBe('World');
  });

  it('should update className of the node when the className prop is a Signal', () => {
    const className = $('test-class');
    const component = new BaseComponent({ className });

    expect(component.node.classList.contains('test-class')).toBe(true);

    className.value = 'new-class';

    expect(component.node.classList.contains('new-class')).toBe(true);
    expect(component.node.classList.contains('test-class')).toBe(false);
  });

  it('should update children of the node when the children prop is a Signal', () => {
    const data = $('Hello');
    const children = $$(() => (data.value === 'Hello' ? new BaseComponent({ txt: data.value }) : null));
    const component = new BaseComponent({}, children);

    expect(component.node.children.length).toBe(1);

    data.value = 'World';

    expect(component.node.children.length).toBe(0);

    data.value = 'Hello';
    expect(component.node.children.length).toBe(1);
  });

  it('should update text content of one the nodes when the children prop is a Signal', () => {
    const data = $('Hello');
    const child1 = $$(() =>
      data.value === 'Hello'
        ? new BaseComponent<HTMLInputElement>({ txt: data.value })
        : new BaseComponent({ txt: 'EMPTY' }),
    );
    const component = new BaseComponent({}, child1, new BaseComponent({ txt: 'OTHER' }));

    expect(component.node.children.item(0)?.textContent).toBe('Hello');

    data.value = 'World';

    expect(component.node.children.item(0)?.textContent).toBe('EMPTY');

    data.value = 'Hello';

    expect(component.node.children.item(0)?.textContent).toBe('Hello');
  });

  it('should remove all subscriptions after replacing element', () => {
    const data = $('Hello');
    const firstChild = new TestComponent({ textContent: data, className: 'first' });
    const emptyChild = new TestComponent({ textContent: 'EMPTY', className: 'empty' });
    const child = $$(() => (data.value === 'Hello' ? firstChild : emptyChild));
    const component = new TestComponent({}, child);

    expect(component.node.children.item(0)?.textContent).toBe('Hello');

    expect(firstChild._subscriptions.length).toBe(1);

    data.value = 'World';

    expect(component.node.children.item(0)?.textContent).toBe('EMPTY');

    data.value = 'Hello';

    expect(component._subscriptions.length).toBe(1);

    expect(component.node.children.item(0)?.textContent).toBe('Hello');

    component.destroy();
    expect(component._children.length).toBe(0);

    setTimeout(() => {
      expect(firstChild._subscriptions.length).toBe(0);
      expect(component._subscriptions.length).toBe(0);
    }, 100);
  });

  it('should update components properly for 2 steps inside signals', () => {
    const data = $('Hello');
    const data2 = $('Hello2');
    const firstChild = new TestComponent({ textContent: data, className: 'first' });
    const secondChild = new TestComponent({ textContent: 'SECOND', className: 'second' });
    const thirdChild = new TestComponent({ textContent: 'THIRD', className: 'third' });
    const emptyChild = new TestComponent({ textContent: 'EMPTY', className: 'empty' });
    const children = $$(() =>
      data.value === 'Hello'
        ? data2.value === 'Hello2'
          ? firstChild
          : secondChild
        : data2.value === 'Hello2'
          ? thirdChild
          : emptyChild,
    );
    const component = new TestComponent({}, children);

    expect(component.node.children.item(0)?.textContent).toBe('Hello');

    data2.value = 'World';

    expect(component.node.children.item(0)?.textContent).toBe('SECOND');

    data.value = 'World';

    expect(component.node.children.item(0)?.textContent).toBe('EMPTY');

    data2.value = 'Hello2';

    expect(component.node.children.item(0)?.textContent).toBe('THIRD');

    data.value = 'Hello';

    expect(component.node.children.item(0)?.textContent).toBe('Hello');

    component.destroy();

    setTimeout(() => {
      expect(firstChild._subscriptions.length).toBe(0);
      expect(secondChild._subscriptions.length).toBe(0);
      expect(thirdChild._subscriptions.length).toBe(0);
      expect(emptyChild._subscriptions.length).toBe(0);
      expect(component._subscriptions.length).toBe(0);
    }, 100);
  });

  it('should remove subscriptions properly for 2 steps inside signals', () => {
    const data = $('Hello');
    const data2 = $('Hello2');
    const firstChild = new TestComponent({ txt: data, className: 'first' });
    const secondChild = new TestComponent({ textContent: data, className: 'second' });
    const thirdChild = new TestComponent({ textContent: 'THIRD', className: 'third' });
    const emptyChild = new TestComponent({ textContent: 'EMPTY', className: 'empty' });
    const child = $$(() =>
      data.value === 'Hello'
        ? data2.value === 'Hello2'
          ? firstChild
          : secondChild
        : data2.value === 'Hello2'
          ? thirdChild
          : emptyChild,
    );
    const component = new TestComponent({}, child);

    expect(firstChild._subscriptions.length).toBe(1);
    expect(component._subscriptions.length).toBe(1);
    expect(component._children.length).toBe(1);

    component.destroy();

    setTimeout(() => {
      expect(firstChild._subscriptions.length).toBe(0);
      expect(component._subscriptions.length).toBe(0);
    }, 100);
  });
});
