import { startSSRServer } from '@control.ts/ssr/server';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT) || 5173;
const base = process.env.BASE || '/movie-app/';

// When transpiled, __dirname is dist/server-runner, we need to go up to project root
const rootDir = __dirname.includes('dist') ? path.resolve(__dirname, '../..') : path.resolve(__dirname, '..');

startSSRServer({
  port,
  base,
  isProduction,
  rootDir,
  entryServerDevPath: '/server/entry-server.ts',
  entryServerProdPath: 'dist/server/entry-server.js',
  templateDevPath: 'index.html',
  templateProdPath: 'dist/client/index.html',
  staticAssetsPath: 'dist/client',
});
