import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['cjs', 'es'],
    },
    sourcemap: true,
    target: 'es2020',
  },
  publicDir: false,
});
