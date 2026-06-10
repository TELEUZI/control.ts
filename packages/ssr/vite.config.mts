import { readdirSync } from 'fs';
import { defineConfig } from 'vite';

const components = readdirSync('src/', 'utf-8');
const componentsEntries = components
  .filter((component) => component.endsWith('.ts'))
  .filter((component) => component !== 'router.ts')
  .map((component) => `src/${component}`);

export default defineConfig({
  build: {
    lib: {
      entry: componentsEntries,
      formats: ['cjs', 'es'],
    },
    sourcemap: true,
    target: 'es2020',
    rollupOptions: {
      external: ['express', 'sirv', 'compression', 'vite', 'fs', 'path', 'url', '@control.ts/control'],
    },
  },
  publicDir: false,
});
