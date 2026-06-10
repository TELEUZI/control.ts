# Movie App - SSR Setup

## Overview

The movie app supports Server-Side Rendering (SSR) using `@control.ts/signals` and Express.js.

## Features

- ✅ **Server-Side Rendering** - Initial HTML rendered on the server
- ✅ **Client-Side Hydration** - Interactive components after page load
- ✅ **Signal State Management** - Reactive state with `@control.ts/signals`
- ✅ **Fast Initial Load** - Pre-rendered content for better performance
- ✅ **SEO Friendly** - Crawlable content for search engines

## Project Structure

```text
apps/web/
├── server/
│   ├── index.ts           # Express server
│   └── entry-server.ts    # Server-side rendering entry
├── src/
│   ├── entry-client.ts    # Client-side hydration entry
│   ├── main.ts            # Original SPA entry (for reference)
│   └── app/               # Application code
├── index.html             # HTML template with SSR outlet
└── package.json           # SSR scripts
```

## Available Scripts

| Script                 | Description                              |
| ---------------------- | ---------------------------------------- |
| `pnpm run dev`         | Start regular Vite dev server (SPA mode) |
| `pnpm run dev:ssr`     | **Start SSR dev server with Express**    |
| `pnpm run build`       | Build regular SPA version                |
| `pnpm run build:client`| Build client bundle for SSR              |
| `pnpm run build:server`| Build server bundle for SSR              |
| `pnpm run build:ssr`   | **Build both client and server for SSR** |
| `pnpm run preview:ssr` | Preview production SSR build             |

## How It Works

### Request Flow

1. **Browser requests page** → `GET /`
2. **Server** (`server/index.ts`):
   - Receives HTTP request
   - Loads HTML template
   - Calls render function
3. **Render** (`server/entry-server.ts`):
   - Creates app component with `PageWrapper()`
   - Pre-fetches initial movie data
   - Renders to HTML using `renderToDocument()`
   - Returns complete HTML with hydration data
4. **Response**:
   - Injects rendered HTML into `<!--ssr-outlet-->`
   - Sends fully-rendered HTML to client
5. **Client-Side Hydration** (`src/entry-client.ts`):
   - Browser displays content immediately (faster FCP)
   - Calls `mountWithHydration()`
   - Attaches event handlers and reconnects signal reactivity
   - App becomes fully interactive without a flash of unstyled content

## Key Files Explained

- **`server/index.ts`**: Express server that handles SSR requests. In development, uses Vite's middleware for hot reloading. In production, serves static files and renders HTML.
- **`server/entry-server.ts`**: Server-side entry point that creates the app and renders it to HTML. Pre-fetches data and includes it in the initial response.
- **`src/entry-client.ts`**: Client-side entry point that hydrates the server-rendered HTML. Uses `mountWithHydration` to preserve server-rendered HTML and make it interactive, rather than replacing it entirely.
- **`index.html`**: HTML template with `<!--ssr-outlet-->` placeholder where server-rendered content is injected.

## Production Deployment Guide

We recommend using `tsx` for running `server/index.ts` in production as it is simple, handles TypeScript natively, and has low overhead.

### Quick Deployment

1. **Build**:
   ```bash
   cd apps/web
   pnpm run build:ssr
   ```
2. **Start Server**:
   ```bash
   NODE_ENV=production tsx server/index.ts
   ```

### Platform-Specific Deployment

#### Vercel

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/web/server/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "apps/web/server/index.ts"
    }
  ]
}
```

#### Netlify

```toml
# netlify.toml
[build]
  command = "pnpm run build:ssr"
  publish = "apps/web/dist/client"
  functions = "apps/web/server"

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/index"
  status = 200
```

#### Docker Container

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile
COPY . .
WORKDIR /app/apps/web
RUN pnpm run build:ssr
EXPOSE 5173
CMD ["pnpm", "run", "preview:ssr"]
```

## Troubleshooting

### Hydration Mismatch
**Problem**: Console warnings about hydration mismatch.
**Solution**: Ensure server and client render the same initial HTML. Verify that:
- No browser-only code runs during SSR.
- No random IDs or timestamps exist in the initial render.
- All data is serializable.

### Styles Not Loading
**Problem**: CSS not applied on server-rendered content.
**Solution**: Make sure CSS imports are in the entry files (`entry-client.ts`) and Vite processes them correctly.

### Module Not Found
**Problem**: Server can't find modules during SSR.
**Solution**: Check that you ran `pnpm install` from the workspace root. Ensure `vite.config.ts` has the correct `ssr.noExternal` configuration for `@control.ts` packages.

## Resources

- [Control.ts SSR Documentation](../../SSR_OVERVIEW.md)
- [Signals SSR Guide](../../packages/signals/SSR_GUIDE.md)
- [Vite SSR Guide](https://vitejs.dev/guide/ssr.html)
- [Express.js Documentation](https://expressjs.com/)
