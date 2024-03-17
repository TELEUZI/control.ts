// import { signal } from '@preact/signals-core';
import { describe, expect, it } from 'vitest';

import { BaseComponent } from '../base-component';
import { $, $$ } from '../signals';

describe('BaseComponent', () => {
  it('should create a new instance of BaseComponent with given props and children', () => {
    const child1 = document.createElement('span');
    const child2 = new BaseComponent({});
    const component = new BaseComponent({ txt: 'Hello', tag: 'div' }, child1, child2);

    expect(component.node.tagName).toBe('DIV');
    expect(component.node.textContent).toBe('Hello');
    expect(component.node.children).toContain(child1);
  });

  it('should set text content of node if txt prop is provided', () => {
    const props = { txt: 'Hello' };
    const component = new BaseComponent(props);

    expect(component.node.textContent).toBe('Hello');
  });

  it('should set tag name of node if tag prop is provided', () => {
    const component = new BaseComponent({ tag: 'span' });

    expect(component.node.tagName).toBe('SPAN');
  });

  it('should create a new instance of BaseComponent with default tag name if tag prop is not provided', () => {
    const component = new BaseComponent({});

    expect(component.node.tagName).toBe('DIV');
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

  it('should add a class to the node when calling addClass method', () => {
    const component = new BaseComponent({});
    component.addClass('test-class');
    expect(component.node.classList.contains('test-class')).toBe(true);
  });

  it('should not append null or undefined children when calling appendChildren method', () => {
    const child1 = document.createElement('span');
    const child2 = null;
    const component = new BaseComponent({ txt: 'Hello', tag: 'div' });

    component.appendChildren([child1, child2]);

    expect(component.node.children).toContain(child1);
    expect(component.node.children).not.toContain(child2);
  });

  it('should toggle a class on the node when calling toggleClass method', () => {
    const component = new BaseComponent({});
    component.toggleClass('active');
    expect(component.node.classList.contains('active')).toBe(true);
    component.toggleClass('active');
    expect(component.node.classList.contains('active')).toBe(false);
  });
});

describe('Signals integration', () => {
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

  it('should update the text content of the node when the txt prop is a Signal', () => {
    const txt = $('Hello');
    const component = new BaseComponent({ txt });

    expect(component.node.textContent).toBe('Hello');

    txt.value = 'World';

    expect(component.node.textContent).toBe('World');
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

  it('should update text content one of the nodes when the children prop is a Signal', () => {
    const data = $('Hello');
    const children = $$(() =>
      data.value === 'Hello' ? new BaseComponent({ txt: data.value }) : new BaseComponent({ txt: 'EMPTY' }),
    );
    const component = new BaseComponent({}, children);

    expect(component.node.children.item(0)?.textContent).toBe('Hello');

    data.value = 'World';

    expect(component.node.children.item(0)?.textContent).toBe('EMPTY');

    data.value = 'Hello';

    expect(component.node.children.item(0)?.textContent).toBe('Hello');
  });
});
