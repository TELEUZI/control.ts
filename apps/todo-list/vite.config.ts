import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  base: '/todo-list/',
  plugins: [tsconfigPaths()],
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
});
