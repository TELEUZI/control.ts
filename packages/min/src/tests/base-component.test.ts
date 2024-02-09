import { describe, expect, it } from 'vitest';

import { BaseComponent, bc$ } from '../base-component';

describe('BaseComponent', () => {
  // should create a new instance of BaseComponent with given props and children
  it('should create a new instance of BaseComponent with given props and children', () => {
    const child1 = document.createElement('span');
    const child2 = new BaseComponent({});
    const component = new BaseComponent({ txt: 'Hello', tag: 'div' }, child1, child2);

    expect(component.node.tagName).toBe('DIV');
    expect(component.node.textContent).toBe('Hello');
    expect(component.node.children).toContain(child1);
  });

  // should set text content of node if txt prop is provided
  it('should set text content of node if txt prop is provided', () => {
    const props = { txt: 'Hello' };
    const component = new BaseComponent(props);

    expect(component.node.textContent).toBe('Hello');
  });

  // should set tag name of node if tag prop is provided
  it('should set tag name of node if tag prop is provided', () => {
    const component = new BaseComponent({ tag: 'span' });

    expect(component.node.tagName).toBe('SPAN');
  });

  // should create a new instance of BaseComponent with default tag name if tag prop is not provided
  it('should create a new instance of BaseComponent with default tag name if tag prop is not provided', () => {
    const component = new BaseComponent({});

    expect(component.node.tagName).toBe('DIV');
  });

  // should not append null children to node
  it('should not append null children to node', () => {
    const props = { txt: 'Hello' };
    const child1 = document.createElement('span');
    const child2 = null;
    const component = new BaseComponent(props, child1, child2);

    expect(component.node.children).toContain(child1);
    expect(component.node.children).not.toContain(child2);
  });

  // should not append null BaseComponent children to node and children array
  it('should not append null BaseComponent children to node and children array', () => {
    const props = { txt: 'Hello' };
    const child1 = document.createElement('span');
    const child2 = new BaseComponent({});
    const child3 = null;
    const component = new BaseComponent(props, child1, child2, child3);

    expect(component.node.children).toContain(child1);
    expect(component.node.children).not.toContain(child2);
    expect(component.node.children).not.toContain(child3);
    expect(component.children).toContain(child2);
    expect(component.children).not.toContain(child3);
  });

  // should add a class to the node when calling addClass method
  it('should add a class to the node when calling addClass method', () => {
    const component = new BaseComponent({ txt: 'Hello', tag: 'div' });

    component.addClass('test-class');

    expect(component.node.classList.contains('test-class')).toBe(true);
  });

  // should not append null or undefined children when calling appendChildren method
  it('should not append null or undefined children when calling appendChildren method', () => {
    const child1 = document.createElement('span');
    const child2 = null;
    const component = new BaseComponent({ txt: 'Hello', tag: 'div' });

    component.appendChildren([child1, child2]);

    expect(component.node.children).toContain(child1);
    expect(component.node.children).not.toContain(child2);
  });

  // should toggle a class on the node when calling toggleClass method
  it('should toggle a class on the node when calling toggleClass method', () => {
    const component = new BaseComponent({});
    component.toggleClass('active');
    expect(component.node.classList.contains('active')).toBe(true);
    component.toggleClass('active');
    expect(component.node.classList.contains('active')).toBe(false);
  });

  // should destroy the node and its children when calling destroy method
  it('should destroy the node and its children when calling destroy method', () => {
    const child1 = document.createElement('span');
    const child2 = new BaseComponent({});
    const component = new BaseComponent({}, child1, child2);
    component.destroy();
    expect(component.node.parentElement).toBeNull();
    expect(component.children.length).toBe(0);
  });

  // should set the text content of the node when calling setTextContent method
  it('should set the text content of the node when calling setTextContent method', () => {
    const component = new BaseComponent({ txt: 'Hello', tag: 'div' });

    component.setTextContent('New Text');

    expect(component.node.textContent).toBe('New Text');
  });

  // should return the outer HTML of the node when calling toString method
  it('should return the outer HTML of the node when calling toString method', () => {
    const component = new BaseComponent({ txt: 'Hello', tag: 'div' });

    const html = component.toString();

    expect(html).toBe('<div>Hello</div>');
  });

  // should have a public children property that is an array of BaseComponent instances
  it('should have a public children property that is an array of BaseComponent instances', () => {
    const component = new BaseComponent({});
    expect(Array.isArray(component.children)).toBe(true);
    expect(component.children).toEqual([]);
  });

  // should have a constructor that accepts props and children as arguments
  it('should create a new instance of BaseComponent with valid props and children', () => {
    const child1 = document.createElement('span');
    const child2 = new BaseComponent({});
    const component = new BaseComponent({ txt: 'Hello', tag: 'div' }, child1, child2);

    expect(component.node.tagName).toBe('DIV');
    expect(component.node.textContent).toBe('Hello');
    expect(component.children).toContain(child2);
    expect(component.node.children).toContain(child1);
  });

  // Can remove a class from an element with a single class
  it('should remove the class when the element has a single class', () => {
    const component = new BaseComponent({
      className: 'class1',
    });

    expect(component.node.classList.contains('class1')).toBe(true);
    component.removeClass('class1');
    expect(component.node.classList.contains('class1')).toBe(false);
  });
});

describe('bc$', () => {
  // should create a new instance of BaseComponent with the given props and children
  it('should create a new instance of BaseComponent with the given props and children', () => {
    const child1 = document.createElement('span');
    const child2 = new BaseComponent({});
    const component = bc$({ txt: 'Hello', tag: 'div' }, child1, child2);

    expect(component).toBeInstanceOf(BaseComponent);
    expect(component.node).toBeInstanceOf(HTMLElement);
    expect(component.node.tagName).toBe('DIV');
    expect(component.node.textContent).toBe('Hello');
    expect(component.children).toContain(child2);
    expect(component.node.children).toContain(child1);
  });
});
