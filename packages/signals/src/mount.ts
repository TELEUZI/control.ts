import { BaseComponent } from './base-component';

export function mount(root: HTMLElement, app: BaseComponent | HTMLElement) {
  root.textContent = '';
  root.append(app instanceof BaseComponent ? app.node : app);
}
