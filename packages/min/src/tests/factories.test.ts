import { describe, expect, it } from 'vitest';

import { createElementFactory } from '../factories';

describe('createElementFactory', () => {
  // should return a function that creates an HTMLElement with given tag and props
  it('should return a function that creates an HTMLElement with given tag and props when called with valid arguments', () => {
    const factory = createElementFactory('div');
    const props = { id: 'myDiv', className: 'container' };
    const element = factory(props);

    expect(element).toBeInstanceOf(HTMLElement);
    expect(element.tagName).toBe('DIV');
    expect(element.id).toBe('myDiv');
    expect(element.className).toBe('container');
  });

  // should create an HTMLElement with given tag and props
  it('should create an HTMLElement with given tag and props when called with valid arguments', () => {
    const factory = createElementFactory('button');
    const props = { id: 'myButton', disabled: true };
    const element = factory(props);

    expect(element).toBeInstanceOf(HTMLElement);
    expect(element.tagName).toBe('BUTTON');
    expect(element.id).toBe('myButton');
    expect(element.disabled).toBe(true);
  });

  // should append children to the created HTMLElement
  it('should append children to the created HTMLElement when called with valid arguments', () => {
    const factory = createElementFactory('div');
    const child1 = document.createElement('span');
    const child2 = document.createElement('p');
    const element = factory({}, child1, child2);

    expect(element).toBeInstanceOf(HTMLElement);
    expect(element.tagName).toBe('DIV');
    expect(element.children.length).toBe(2);
    expect(element.children[0]).toBe(child1);
    expect(element.children[1]).toBe(child2);
  });

  // should not throw an error when called without props or children
  it('should not throw an error when called without props or children', () => {
    const factory = createElementFactory('div');

    expect(() => {
      factory({});
    }).not.toThrow();
  });
});
