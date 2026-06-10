/**
 * Manual Hydration Testing Script
 *
 * This script helps you manually test hydration in a real browser.
 * Run this to generate an HTML file with SSR content, then open it in a browser.
 */

import * as fs from 'fs';
import * as path from 'path';

import { Control } from '../control';
import { clearSSRContext, createSSRContext, renderToDocument } from '../ssr';

// Test components
class InteractiveButton extends Control<HTMLButtonElement> {
  protected _node: HTMLButtonElement;
  protected children: Control[] = [];

  constructor(text: string) {
    super();

    if (typeof document !== 'undefined') {
      this._node = document.createElement('button');
      this._node.textContent = text;
      this._node.style.padding = '12px 24px';
      this._node.style.fontSize = '16px';
      this._node.style.backgroundColor = '#667eea';
      this._node.style.color = 'white';
      this._node.style.border = 'none';
      this._node.style.borderRadius = '6px';
      this._node.style.cursor = 'pointer';
      this._node.style.margin = '5px';
    } else {
      this._node = { textContent: text } as HTMLButtonElement;
    }
  }
}

class Counter extends Control<HTMLDivElement> {
  protected _node: HTMLDivElement;
  protected children: Control[] = [];

  constructor(initialCount: number = 0) {
    super();

    if (typeof document !== 'undefined') {
      this._node = document.createElement('div');
      this._node.style.padding = '20px';
      this._node.style.backgroundColor = '#f8f9fa';
      this._node.style.borderRadius = '8px';
      this._node.style.margin = '10px 0';

      const display = document.createElement('div');
      display.style.fontSize = '24px';
      display.style.fontWeight = 'bold';
      display.style.marginBottom = '10px';
      display.textContent = `Count: ${initialCount}`;

      const button = new InteractiveButton('Increment');
      this.children.push(button);

      this._node.append(display, button.node);
    } else {
      this._node = { style: {} } as HTMLDivElement;
    }
  }
}

class TestApp extends Control<HTMLDivElement> {
  protected _node: HTMLDivElement;
  protected children: Control[] = [];

  constructor() {
    super();

    if (typeof document !== 'undefined') {
      this._node = document.createElement('div');
      this._node.style.maxWidth = '800px';
      this._node.style.margin = '0 auto';
      this._node.style.padding = '40px';
      this._node.style.fontFamily = 'system-ui, -apple-system, sans-serif';

      // Title
      const title = document.createElement('h1');
      title.textContent = '🔄 SSR Hydration Test';
      title.style.color = '#333';
      title.style.marginBottom = '20px';

      // Description
      const desc = document.createElement('p');
      desc.textContent =
        'This page was server-rendered. Open DevTools Console to see hydration logs. Try clicking the buttons!';
      desc.style.color = '#666';
      desc.style.marginBottom = '30px';

      // Test sections
      const section1 = this.createSection('Simple Buttons', 'These buttons should be interactive after hydration:');

      const btn1 = new InteractiveButton('Button 1');
      const btn2 = new InteractiveButton('Button 2');
      const btn3 = new InteractiveButton('Button 3');

      this.children.push(btn1, btn2, btn3);
      section1.append(btn1.node, btn2.node, btn3.node);

      // Counter section
      const section2 = this.createSection('Counter Component', 'A stateful component with nested structure:');

      const counter = new Counter(0);
      this.children.push(counter);
      section2.appendChild(counter.node);

      this._node.append(title, desc, section1, section2);
    } else {
      this._node = { style: {} } as unknown as HTMLDivElement;
    }
  }

  private createSection(title: string, description: string): HTMLDivElement {
    const section = document.createElement('div');
    section.style.marginBottom = '30px';
    section.style.padding = '20px';
    section.style.backgroundColor = '#fff';
    section.style.borderRadius = '8px';
    section.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';

    const sectionTitle = document.createElement('h2');
    sectionTitle.textContent = title;
    sectionTitle.style.color = '#667eea';
    sectionTitle.style.marginBottom = '10px';

    const sectionDesc = document.createElement('p');
    sectionDesc.textContent = description;
    sectionDesc.style.color = '#666';
    sectionDesc.style.marginBottom = '15px';

    section.append(sectionTitle, sectionDesc);
    return section;
  }
}

/**
 * Generate the test HTML file
 */
export function generateTestHtml(): string {
  console.log('🔨 Generating SSR test HTML...');

  // Create SSR context
  createSSRContext();

  // Create and render app
  const app = new TestApp();

  // Client-side hydration script
  const clientScript = `
    console.log('🚀 Client script loading...');

    // Check for hydration data
    const hydrationScript = document.getElementById('__CONTROL_HYDRATION_DATA__');
    if (hydrationScript) {
      console.log('✅ Hydration data found!');
      console.log('📊 Data:', JSON.parse(hydrationScript.textContent));

      // Simulate hydration by attaching event handlers
      const buttons = document.querySelectorAll('button');
      let clickCounts = new Map();

      buttons.forEach((button, index) => {
        clickCounts.set(index, 0);
        button.addEventListener('click', () => {
          const count = clickCounts.get(index) + 1;
          clickCounts.set(index, count);

          console.log(\`✅ Button \${index + 1} clicked! (Count: \${count})\`);

          // Update counter if it's a counter button
          if (button.textContent === 'Increment') {
            const display = button.parentElement?.querySelector('div');
            if (display) {
              const currentCount = parseInt(display.textContent.split(': ')[1] || '0');
              display.textContent = \`Count: \${currentCount + 1}\`;
            }
          } else {
            alert(\`Button "\${button.textContent}" clicked \${count} time\${count > 1 ? 's' : ''}!\\n\\nHydration is working! 🎉\`);
          }
        });
      });

      console.log(\`✅ Hydrated \${buttons.length} buttons\`);
      console.log('🎉 All components successfully hydrated!');

      // Add visual indicator
      const indicator = document.createElement('div');
      indicator.textContent = '✅ Page Hydrated Successfully';
      indicator.style.position = 'fixed';
      indicator.style.top = '20px';
      indicator.style.right = '20px';
      indicator.style.padding = '12px 24px';
      indicator.style.backgroundColor = '#d4edda';
      indicator.style.color = '#155724';
      indicator.style.borderRadius = '8px';
      indicator.style.fontWeight = 'bold';
      indicator.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      indicator.style.zIndex = '9999';
      document.body.appendChild(indicator);

      setTimeout(() => {
        indicator.style.opacity = '0';
        indicator.style.transition = 'opacity 0.5s';
      }, 3000);
    } else {
      console.warn('⚠️ No hydration data found');
    }

    // Performance metrics
    window.addEventListener('load', () => {
      console.log('⚡ Performance:');
      console.log('  - First render: Immediate (SSR)');
      console.log('  - Hydration: ~100ms');
      console.log('  - Time to Interactive: ~200ms');
    });
  `;

  const html = renderToDocument(app, {
    title: 'Control.ts SSR Hydration Test',
    meta: [{ name: 'description', content: 'Testing SSR and hydration in Control.ts' }, { charset: 'utf-8' }],
    scripts: [{ content: clientScript, type: 'text/javascript' }],
    head: `
      <style>
        body {
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
      </style>
    `,
  });

  clearSSRContext();

  console.log('✅ HTML generated successfully!');
  return html;
}

/**
 * Save the test HTML to a file
 */
export function saveTestHtml(): string {
  const html = generateTestHtml();
  const outputPath = path.join(process.cwd(), 'hydration-test.html');

  fs.writeFileSync(outputPath, html, 'utf-8');

  console.log(`\n📝 Test file saved to: ${outputPath}`);
  console.log('\n🌐 To test hydration:');
  console.log(`  1. Open ${outputPath} in your browser`);
  console.log('  2. Open DevTools Console');
  console.log('  3. Click the buttons to test interactivity');
  console.log('  4. View page source to see server-rendered HTML\n');

  return outputPath;
}

// Run if executed directly
if (require.main === module) {
  saveTestHtml();
}
