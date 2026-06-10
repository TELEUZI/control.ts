import type { Route } from '@control.ts/router';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

export type BuildStaticPagesOptions = {
  rootDir: string;
  templatePath: string; // e.g. 'dist/client/index.html'
  entryServerPath: string; // e.g. 'dist/server/entry-server.js'
  outDir: string; // e.g. 'dist/client'
};

export async function buildStaticPages(options: BuildStaticPagesOptions) {
  const { rootDir, templatePath, entryServerPath, outDir } = options;

  console.log('🚀 Starting Static Site Generation (SSG)...');

  // Load the template
  const resolvedTemplatePath = path.resolve(rootDir, templatePath);
  if (!fs.existsSync(resolvedTemplatePath)) {
    console.error(`Error: ${templatePath} not found. Did you run build:client?`);
    process.exit(1);
  }
  const template = fs.readFileSync(resolvedTemplatePath, 'utf-8');

  // Load the server entry
  const resolvedEntryServerPath = path.resolve(rootDir, entryServerPath);
  if (!fs.existsSync(resolvedEntryServerPath)) {
    console.error(`Error: ${entryServerPath} not found. Did you run build:server?`);
    process.exit(1);
  }

  // Convert to file:// URL for Windows compatibility
  const { render, routes } = await import(pathToFileURL(resolvedEntryServerPath).href);

  if (!routes) {
    console.error('Error: exported routes not found in entry-server.js');
    process.exit(1);
  }

  // Iterate over static routes
  for (const route of routes as Route<unknown>[]) {
    // Skip dynamic routes like /:id
    if (route.path.includes(':')) {
      console.log(`⏭️  Skipping dynamic route: ${route.path}`);
      continue;
    }

    try {
      console.log(`⚡ Pre-rendering route: ${route.path || '/'}`);
      const rendered = await render(route.path);
      const html = template.replace('<!--ssr-outlet-->', rendered.html).replace('</head>', `${rendered.head}</head>`);

      // Determine output path
      let routeOutDir = path.resolve(rootDir, outDir, route.path.replace(/^\//, ''));
      if (route.path === '/') {
        routeOutDir = path.resolve(rootDir, outDir);
      }

      // Ensure directory exists
      if (!fs.existsSync(routeOutDir)) {
        fs.mkdirSync(routeOutDir, { recursive: true });
      }

      const outPath = path.resolve(routeOutDir, 'index.html');
      fs.writeFileSync(outPath, html, 'utf-8');

      console.log(`✅ Saved ${outPath}`);
    } catch (e) {
      console.error(`❌ Failed to pre-render route ${route.path}:`, e);
    }
  }

  console.log('🎉 SSG completed successfully!');
}
