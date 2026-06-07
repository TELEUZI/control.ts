import { copyFileSync, mkdirSync, readdirSync } from 'fs';
import { defineConfig } from 'vite';

const components = readdirSync('src/', 'utf-8');
const componentsEntries = components
  .filter((component) => component.endsWith('.ts'))
  .map((component) => `src/${component}`);

// Add DND entry point
const entries = [...componentsEntries, 'src/dnd/index.ts'];

export default defineConfig({
  plugins: [
    {
      name: 'copy-dnd-css',
      closeBundle() {
        mkdirSync('dist/dnd', { recursive: true });
        copyFileSync('src/dnd/dnd.css', 'dist/dnd/dnd.css');
      },
    },
  ],
  build: {
    lib: {
      entry: entries,
      formats: ['cjs', 'es'],
    },
    sourcemap: true,
    target: 'es2020',
  },
  publicDir: false,
});
