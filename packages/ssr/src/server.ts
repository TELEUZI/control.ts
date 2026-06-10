import express from 'express';
import fs from 'fs';
import type { ServerResponse } from 'http';
import path from 'path';
import { pathToFileURL } from 'url';
import type { ViteDevServer } from 'vite';

export type SSRServerOptions = {
  port: number;
  base: string;
  isProduction: boolean;
  rootDir: string;
  entryServerDevPath: string; // e.g. '/server/entry-server.ts'
  entryServerProdPath: string; // e.g. 'dist/server/entry-server.js'
  templateDevPath: string; // e.g. 'index.html'
  templateProdPath: string; // e.g. 'dist/client/index.html'
  staticAssetsPath: string; // e.g. 'dist/client'
};

export async function startSSRServer(options: SSRServerOptions) {
  const {
    port,
    base,
    isProduction,
    rootDir,
    entryServerDevPath,
    entryServerProdPath,
    templateDevPath,
    templateProdPath,
    staticAssetsPath,
  } = options;

  const app = express();

  // Define cache structure
  type CacheEntry = {
    html: string;
    timestamp: number;
    revalidate?: number; // Cache duration in seconds
  };
  const ssrCache = new Map<string, CacheEntry>();

  // Serve static assets in development
  if (!isProduction) {
    app.use('/src/assets', express.static(path.resolve(rootDir, 'src/assets')));
  }

  let vite: ViteDevServer;
  if (!isProduction) {
    const { createServer } = await import('vite');
    vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom',
      base,
      root: rootDir,
    });
    app.use(vite.middlewares);
  } else {
    const compression = (await import('compression')).default;
    const sirv = (await import('sirv')).default;
    app.use(compression());
    app.use(
      base,
      sirv(path.resolve(rootDir, staticAssetsPath), {
        extensions: [],
        setHeaders: (res: ServerResponse, pathname: string) => {
          if (pathname.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
          } else if (pathname.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
          }
        },
      }),
    );
  }

  app.get('*', async (req, res, next) => {
    // Skip SSR for static assets
    if (
      req.originalUrl.includes('/assets/') ||
      req.originalUrl.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)
    ) {
      return next();
    }

    try {
      const url = req.originalUrl.replace(base, '');

      let template: string;
      let render: (url: string) => Promise<{ html: string; head: string; revalidate?: number }>;

      if (!isProduction) {
        template = fs.readFileSync(path.resolve(rootDir, templateDevPath), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule(entryServerDevPath)).render;
      } else {
        if (ssrCache.has(url)) {
          const cached = ssrCache.get(url)!;
          const ageSeconds = (Date.now() - cached.timestamp) / 1000;

          if (cached.revalidate && ageSeconds > cached.revalidate) {
            console.log(`[ISR] Background revalidating stale route: ${url || '/'}`);

            const resolvedEntryPath = path.resolve(rootDir, entryServerProdPath);
            import(pathToFileURL(resolvedEntryPath).href)
              .then(async (result) => {
                try {
                  const rendered = await result.render(url);
                  const tmpl = fs.readFileSync(path.resolve(rootDir, templateProdPath), 'utf-8');
                  const html = tmpl
                    .replace('<!--ssr-outlet-->', rendered.html)
                    .replace('</head>', `${rendered.head}</head>`);
                  ssrCache.set(url, { html, timestamp: Date.now(), revalidate: rendered.revalidate });
                  console.log(`[ISR] Revalidated route: ${url || '/'}`);
                } catch (err) {
                  console.error(`[ISR] Revalidation failed for ${url || '/'}:`, err);
                }
              })
              .catch(console.error);
          }

          return res.status(200).set({ 'Content-Type': 'text/html' }).end(cached.html);
        }

        template = fs.readFileSync(path.resolve(rootDir, templateProdPath), 'utf-8');
        const resolvedEntryPath = path.resolve(rootDir, entryServerProdPath);
        const result = await import(pathToFileURL(resolvedEntryPath).href);
        render = result.render;
      }

      const rendered = await render(url);
      const html = template.replace('<!--ssr-outlet-->', rendered.html).replace('</head>', `${rendered.head}</head>`);

      if (isProduction) {
        ssrCache.set(url, { html, timestamp: Date.now(), revalidate: rendered.revalidate });
      }

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      !isProduction && vite?.ssrFixStacktrace(err);
      console.error(err.stack);
      res.status(500).end(err.stack);
    }
  });

  app.listen(port, () => {
    console.log(`🚀 SSR Server running at http://localhost:${port}${base}`);
  });
}
