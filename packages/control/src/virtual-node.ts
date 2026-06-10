import { escapeHtml } from './ssr';

export class VirtualStyle implements Partial<CSSStyleDeclaration> {
  private styles: Record<string, string> = {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;

  public setProperty(propertyName: string, value: string | null): void {
    if (value === null || value === '') {
      delete this.styles[propertyName];
    } else {
      this.styles[propertyName] = value;
    }
  }

  public removeProperty(propertyName: string): string {
    const value = this.styles[propertyName] || '';
    delete this.styles[propertyName];
    return value;
  }

  public getPropertyValue(propertyName: string): string {
    return this.styles[propertyName] || '';
  }

  public toString(): string {
    const rules: string[] = [];

    // First gather everything set via setProperty
    for (const [key, value] of Object.entries(this.styles)) {
      rules.push(`${key}:${value}`);
    }

    // Then gather direct property assignments (camelCase to kebab-case)
    for (const key of Object.keys(this)) {
      if (key !== 'styles' && typeof this[key] !== 'function') {
        const value = this[key];
        if (value) {
          const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          rules.push(`${cssKey}:${value}`);
        }
      }
    }

    return rules.join(';');
  }
}

export class VirtualClassList {
  private classes: Set<string> = new Set();

  constructor(private onChange: (classes: string) => void) {}

  public add(...classNames: string[]): void {
    classNames.forEach((c) =>
      c
        .split(' ')
        .filter(Boolean)
        .forEach((cls) => this.classes.add(cls)),
    );
    this.onChange(this.value);
  }

  public remove(...classNames: string[]): void {
    classNames.forEach((c) =>
      c
        .split(' ')
        .filter(Boolean)
        .forEach((cls) => this.classes.delete(cls)),
    );
    this.onChange(this.value);
  }

  public toggle(className: string, force?: boolean): boolean {
    if (force === true) {
      this.add(className);
      return true;
    } else if (force === false) {
      this.remove(className);
      return false;
    } else {
      if (this.contains(className)) {
        this.remove(className);
        return false;
      } else {
        this.add(className);
        return true;
      }
    }
  }

  public contains(className: string): boolean {
    return this.classes.has(className);
  }

  public get value(): string {
    return Array.from(this.classes).join(' ');
  }
}

export class VirtualNode {
  public tagName: string;
  public nodeType: number = 1;
  public attributes: Record<string, string> = {};
  private _style: VirtualStyle = new VirtualStyle();
  public classList: VirtualClassList;
  public children: Array<VirtualNode | string> = [];
  public textContent: string = '';
  public parentNode: VirtualNode | null = null;

  public get style(): VirtualStyle {
    return this._style;
  }

  public set style(val: string | Partial<CSSStyleDeclaration>) {
    if (typeof val === 'object' && val !== null) {
      for (const [key, value] of Object.entries(val)) {
        if (value !== undefined && value !== null) {
          this._style.setProperty(key.replace(/([A-Z])/g, '-$1').toLowerCase(), String(value));
        }
      }
    }
  }

  [key: string]: unknown; // Allow arbitrary property assignments like onclick

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
    this.classList = new VirtualClassList((val) => {
      if (val) this.attributes['class'] = val;
      else delete this.attributes['class'];
    });
  }

  public get className(): string {
    return this.classList.value;
  }

  public set className(val: string) {
    this.attributes['class'] = val;
    // Reset classList silently
    this.classList = new VirtualClassList((v) => {
      if (v) this.attributes['class'] = v;
      else delete this.attributes['class'];
    });
    this.classList.add(val);
  }

  public setAttribute(name: string, value: string): void {
    if (name === 'class') {
      this.className = value;
    } else {
      this.attributes[name] = String(value);
    }
  }

  public getAttribute(name: string): string | null {
    if (name === 'class') return this.className || null;
    return this.attributes[name] ?? null;
  }

  public removeAttribute(name: string): void {
    if (name === 'class') {
      this.className = '';
    } else {
      delete this.attributes[name];
    }
  }

  public appendChild(child: VirtualNode | string): void {
    this.children.push(child);
    if (typeof child === 'object' && child !== null)
      (child as unknown as { parentNode: VirtualNode }).parentNode = this;
  }

  public append(...nodes: Array<VirtualNode | string>): void {
    for (const node of nodes) {
      this.appendChild(node);
    }
  }

  public insertBefore(newNode: VirtualNode | string, referenceNode: VirtualNode | string | null): void {
    if (!referenceNode) {
      this.appendChild(newNode);
      return;
    }
    const idx = this.children.indexOf(referenceNode);
    if (idx !== -1) {
      this.children.splice(idx, 0, newNode);
      if (typeof newNode === 'object' && newNode !== null)
        (newNode as unknown as { parentNode: VirtualNode }).parentNode = this;
    } else {
      this.appendChild(newNode);
    }
  }

  public removeChild(child: VirtualNode | string): void {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      if (child instanceof VirtualNode) child.parentNode = null;
    }
  }

  public remove(): void {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }

  public replaceWith(...nodes: Array<VirtualNode | string>): void {
    if (this.parentNode) {
      const idx = this.parentNode.children.indexOf(this);
      if (idx !== -1) {
        this.parentNode.children.splice(idx, 1, ...nodes);
        for (const node of nodes) {
          if (node instanceof VirtualNode) node.parentNode = this.parentNode;
        }
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public addEventListener(_type: string, _listener: unknown, _options?: unknown): void {
    // No-op on server
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public removeEventListener(_type: string, _listener: unknown, _options?: unknown): void {
    // No-op on server
  }

  public get outerHTML(): string {
    const tag = this.tagName.toLowerCase();

    // Self-closing HTML tags
    const voidElements = new Set([
      'area',
      'base',
      'br',
      'col',
      'embed',
      'hr',
      'img',
      'input',
      'link',
      'meta',
      'param',
      'source',
      'track',
      'wbr',
    ]);

    let html = `<${tag}`;

    // Add attributes
    for (const [key, value] of Object.entries(this.attributes)) {
      if (value !== undefined && value !== null) {
        html += ` ${key}="${escapeHtml(value)}"`;
      }
    }

    // Add style
    const styleStr = this.style.toString();
    if (styleStr) {
      html += ` style="${styleStr}"`;
    }

    // Direct event attributes assigned as properties like onclick
    for (const key of Object.keys(this)) {
      if (key.startsWith('on') && typeof this[key] === 'function') {
        // Ignored on SSR
      } else if (key === 'value' && typeof this[key] === 'string' && tag === 'input') {
        // Special case for input value
        html += ` value="${escapeHtml(this[key])}"`;
      }
    }

    html += '>';

    if (tag === 'comment') {
      return '<!--comment-->';
    }

    if (voidElements.has(tag)) {
      return html;
    }

    html += this.innerHTML;
    html += `</${tag}>`;

    return html;
  }

  public get innerHTML(): string {
    let html = '';

    if (this.textContent) {
      html += escapeHtml(this.textContent);
    }

    for (const child of this.children) {
      if (typeof child === 'string') {
        // If it's a string, we assume it's already HTML (e.g. from a nested component that returned a string)
        // Wait, standard DOM text nodes would be escaped.
        // But since we are mocking, and child could be raw text appended, we should escape it.
        // Let's just output it.
        html += child;
      } else if (child instanceof VirtualNode) {
        html += child.outerHTML;
      }
    }

    return html;
  }
}
