import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { defineConfig } from 'vite';

// Generate entry points object dynamically
const entries: Record<string, string> = {};
const files = readdirSync('src');
for (const file of files) {
  const filePath = join('src', file);
  if (statSync(filePath).isFile() && file.endsWith('.ts')) {
    const name = file.replace(/\.ts$/, '');
    entries[name] = filePath.replace(/\\/g, '/'); // Normalize path for Vite/Rollup
  }
}

// Add DND entry point (re-exports from @control.ts/control/dnd)
entries['dnd'] = 'src/dnd/index.ts';

export default defineConfig({
  plugins: [
    {
      name: 'copy-dnd-css',
      closeBundle() {
        // CSS lives in @control.ts/control; forward it into min's dist for backwards compat
        mkdirSync('dist/dnd', { recursive: true });
        copyFileSync('../../packages/control/src/dnd/dnd.css', 'dist/dnd/dnd.css');
      },
    },
  ],
  build: {
    lib: {
      entry: entries,
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      external: [/^@control\.ts\//],
    },
    sourcemap: true,
    target: 'es2020',
  },
  publicDir: false,
});
