import { defineConfig } from 'vite';
import { readdirSync } from 'fs';

const components = readdirSync('src/', 'utf-8');
const componentsEntries = components
  .filter((component) => component.endsWith('.ts'))
  .map((component) => `src/${component}`);

export default defineConfig({
  build: {
    lib: {
      entry: componentsEntries,
      formats: ['cjs', 'es'],
    },
    sourcemap: true,
    target: 'es2020',
  },
  publicDir: false,
});
