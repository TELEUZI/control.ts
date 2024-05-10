import type { BaseComponent } from './base-component';

/**
 * Converts a class component to a functional component.
 * @param bc - The class component to convert.
 * @returns - A function that creates instances of the converted functional component.
 *
 * @example
 *
 * class SomeComponent extends BaseComponent {
 *   constructor(public someArg: string) {
 *     super({});
 *   }

 *   public someMethod(someArg: number) {
 *     console.log("i'm useless", someArg);
 *   }
 * }

 * const Some = bcToFc(SomeComponent);

 * Some('hello').someMethod(50); // "i'm useless" 50
 */
export const bcToFc =
  <T extends BaseComponent, A extends ReadonlyArray<unknown>>(bc: { new (...args: A): T }) =>
  (...args: A) =>
    new bc(...args);
