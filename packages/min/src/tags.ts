import { createElementFactory, createElementFactory$, createElementFactoryWithCustomProps } from './base-component';

export const span$ = createElementFactory$('span');
export const div$ = createElementFactory$('div');
export const a$ = createElementFactory$('a');

export const iconFromCode = (code: string) => createElementFactoryWithCustomProps('i', { innerHTML: code });

export const h1 = createElementFactory('h1');
export const h2 = createElementFactory('h2');
export const h3 = createElementFactory('h3');
export const img = createElementFactory('img');
export const div = createElementFactory('div');
export const span = createElementFactory('span');
export const main = createElementFactory('main');
export const label = createElementFactory('label');
export const input = createElementFactory('input');
