import { defineConfig } from 'vite';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import { readdirSync } from 'fs';

const components = readdirSync('src/', { recursive: true, encoding: 'utf-8' });
const componentsEntries = components
  .filter((component) => component.endsWith('.ts'))
  .map((component) => {
    console.log(component);
    return `src/${component}`;
  });

export default defineConfig({
  build: {
    copyPublicDir: false,
    lib: {
      formats: ['cjs', 'es'],
      entry: componentsEntries,
    },
    sourcemap: true,
    target: 'es2020',
  },
  publicDir: false,
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  plugins: [libInjectCss()],
});
