/**
 * Example: Server-Side Rendering with Control.ts
 *
 * This example demonstrates how to use SSR in a Node.js server environment.
 * You would typically use this with Express, Fastify, or any Node.js server.
 */

import { Control } from '../control';
// import { createElementFactoryUniversal } from '../factories-ssr';
import { createSSRContext, renderControlToString, renderToDocument } from '../ssr';

// Create universal element factories (work in both server and browser)
// const div = createElementFactoryUniversal('div');
// const h1 = createElementFactoryUniversal('h1');
// const p = createElementFactoryUniversal('p');
// const button = createElementFactoryUniversal('button');

// Example component using Control class
class AppComponent extends Control<HTMLDivElement> {
  protected _node: HTMLDivElement;
  protected children: Control[] = [];

  constructor() {
    super();

    // In SSR mode, this would use the universal factory
    if (typeof document !== 'undefined') {
      this._node = document.createElement('div');
      this._node.className = 'app-container';
      this.render();
    } else {
      // SSR mode - create a minimal node representation
      this._node = { className: 'app-container' } as HTMLDivElement;
    }
  }

  private render(): void {
    if (typeof document === 'undefined') return;

    const title = document.createElement('h1');
    title.textContent = 'Welcome to Control.ts with SSR!';
    this._node.appendChild(title);

    const description = document.createElement('p');
    description.textContent = 'This page was server-rendered and can be hydrated on the client.';
    this._node.appendChild(description);

    const btn = document.createElement('button');
    btn.textContent = 'Click me!';
    btn.onclick = () => alert('Button clicked after hydration!');
    this._node.appendChild(btn);
  }
}

/**
 * Render app to HTML string (for API routes or SSR servers)
 */
export function renderApp(): string {
  // Initialize SSR context
  createSSRContext();

  // Create your app
  const app = new AppComponent();

  // Render to complete HTML document
  return renderToDocument(app, {
    title: 'Control.ts SSR Example',
    meta: [
      { name: 'description', content: 'Server-side rendered Control.ts application' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    ],
    links: [{ rel: 'stylesheet', href: '/styles/main.css' }],
    scripts: [{ src: '/dist/client.js', type: 'module', defer: 'true' }],
    lang: 'en',
  });
}

/**
 * Express.js example
 */
export function expressExample() {
  // This is pseudo-code to show how you'd integrate with Express
  /*
  import express from 'express';

  const app = express();

  app.get('/', (req, res) => {
    const html = renderApp();
    res.send(html);
  });

  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
  */
}

/**
 * Fastify example
 */
export function fastifyExample() {
  // This is pseudo-code to show how you'd integrate with Fastify
  /*
  import Fastify from 'fastify';

  const fastify = Fastify();

  fastify.get('/', async (request, reply) => {
    const html = renderApp();
    reply.type('text/html').send(html);
  });

  fastify.listen({ port: 3000 }, (err) => {
    if (err) throw err;
    console.log('Server running on http://localhost:3000');
  });
  */
}

/**
 * Render specific component to string (for partial rendering)
 */
export function renderPartial(): string {
  createSSRContext();
  const component = new AppComponent();
  return renderControlToString(component);
}
