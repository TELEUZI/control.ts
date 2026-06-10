/**
 * Simple SSR Demo
 *
 * A minimal example showing SSR in action.
 * Run this with Node.js to see server-rendered output.
 */

import { Control } from '../control';
import { clearSSRContext, createSSRContext, renderControlToString, renderToDocument } from '../ssr';

/**
 * Simple Hello World Component
 */
class HelloWorld extends Control<HTMLDivElement> {
  protected _node: HTMLDivElement;
  protected children: Control[] = [];

  constructor(name: string = 'World') {
    super();

    // In browser
    if (typeof document !== 'undefined') {
      this._node = document.createElement('div');
      this._node.className = 'hello-container';

      const heading = document.createElement('h1');
      heading.textContent = `Hello, ${name}!`;
      heading.style.color = 'blue';

      const paragraph = document.createElement('p');
      paragraph.textContent = 'This component was server-rendered.';

      this._node.append(heading, paragraph);
    } else {
      // SSR fallback
      this._node = { className: 'hello-container' } as HTMLDivElement;
    }
  }
}

/**
 * Demo 1: Render component to string only
 */
export function demo1_ComponentToString(): void {
  console.log('=== Demo 1: Component to String ===\n');

  createSSRContext();
  const component = new HelloWorld('SSR');
  const html = renderControlToString(component);

  console.log(html);
  console.log('\n');

  clearSSRContext();
}

/**
 * Demo 2: Render full HTML document
 */
export function demo2_FullDocument(): void {
  console.log('=== Demo 2: Full HTML Document ===\n');

  const component = new HelloWorld('Control.ts');
  const html = renderToDocument(component, {
    title: 'Control.ts SSR Demo',
    meta: [{ name: 'description', content: 'A simple SSR demo with Control.ts' }],
    links: [{ rel: 'stylesheet', href: '/styles.css' }],
    scripts: [{ src: '/client.js', type: 'module', defer: 'true' }],
  });

  console.log(html);
  console.log('\n');
}

/**
 * Demo 3: Multiple components
 */
class Card extends Control<HTMLDivElement> {
  protected _node: HTMLDivElement;
  protected children: Control[] = [];

  constructor(title: string, content: string) {
    super();

    if (typeof document !== 'undefined') {
      this._node = document.createElement('div');
      this._node.className = 'card';
      this._node.style.border = '1px solid #ccc';
      this._node.style.padding = '16px';
      this._node.style.marginBottom = '8px';

      const heading = document.createElement('h2');
      heading.textContent = title;

      const text = document.createElement('p');
      text.textContent = content;

      this._node.append(heading, text);
    } else {
      this._node = { className: 'card' } as HTMLDivElement;
    }
  }
}

class Dashboard extends Control<HTMLDivElement> {
  protected _node: HTMLDivElement;
  protected children: Control[] = [];

  constructor() {
    super();

    if (typeof document !== 'undefined') {
      this._node = document.createElement('div');
      this._node.className = 'dashboard';

      const title = document.createElement('h1');
      title.textContent = 'Dashboard';
      this._node.appendChild(title);

      // Add cards
      const card1 = new Card('Card 1', 'This is the first card');
      const card2 = new Card('Card 2', 'This is the second card');
      const card3 = new Card('Card 3', 'This is the third card');

      this.children.push(card1, card2, card3);
      this._node.append(card1.node, card2.node, card3.node);
    } else {
      this._node = { className: 'dashboard' } as HTMLDivElement;
    }
  }
}

export function demo3_MultipleComponents(): void {
  console.log('=== Demo 3: Multiple Components ===\n');

  const dashboard = new Dashboard();
  const html = renderToDocument(dashboard, {
    title: 'Dashboard - Control.ts SSR',
    links: [{ rel: 'stylesheet', href: '/dashboard.css' }],
  });

  console.log(html);
  console.log('\n');
}

/**
 * Demo 4: Dynamic content simulation
 */
interface User {
  name: string;
  email: string;
  role: string;
}

class UserProfile extends Control<HTMLDivElement> {
  protected _node: HTMLDivElement;
  protected children: Control[] = [];

  constructor(user: User) {
    super();

    if (typeof document !== 'undefined') {
      this._node = document.createElement('div');
      this._node.className = 'user-profile';

      const name = document.createElement('h1');
      name.textContent = user.name;

      const email = document.createElement('p');
      email.textContent = `Email: ${user.email}`;

      const role = document.createElement('p');
      role.textContent = `Role: ${user.role}`;
      role.style.fontWeight = 'bold';

      const button = document.createElement('button');
      button.textContent = 'Edit Profile';
      button.className = 'btn-primary';

      this._node.append(name, email, role, button);
    } else {
      this._node = { className: 'user-profile' } as HTMLDivElement;
    }
  }
}

export function demo4_DynamicContent(): void {
  console.log('=== Demo 4: Dynamic Content (User Profile) ===\n');

  // Simulate fetching user data from database
  const user: User = {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    role: 'Administrator',
  };

  const profile = new UserProfile(user);
  const html = renderToDocument(profile, {
    title: `${user.name}'s Profile`,
    meta: [
      { property: 'og:title', content: `${user.name}'s Profile` },
      { property: 'og:description', content: `Profile page for ${user.name}` },
    ],
    scripts: [{ src: '/profile.js', type: 'module' }],
  });

  console.log(html);
  console.log('\n');
}

/**
 * Run all demos
 */
export function runAllDemos(): void {
  demo1_ComponentToString();
  demo2_FullDocument();
  demo3_MultipleComponents();
  demo4_DynamicContent();
}

// If running this file directly with Node.js
if (require.main === module) {
  runAllDemos();
}
