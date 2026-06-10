import { buildStaticPages } from '@control.ts/ssr/prerender';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// When transpiled, __dirname is dist/server-runner, we need to go up to project root
const rootDir = __dirname.includes('dist') ? path.resolve(__dirname, '../..') : path.resolve(__dirname, '..');

buildStaticPages({
  rootDir,
  templatePath: 'dist/client/index.html',
  entryServerPath: 'dist/server/entry-server.js',
  outDir: 'dist/client',
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
