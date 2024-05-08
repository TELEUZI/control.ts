import type { BaseComponent } from '@control.ts/min';

/**
 * Converts a class component to a functional component.
 * @param bc - The class component to convert.
 * @returns - A function that creates instances of the converted functional component.
 */
export const bcToFc =
  <T extends BaseComponent, A extends ReadonlyArray<unknown>>(bc: { new (...args: A): T }) =>
  (...args: A) =>
    new bc(...args);
