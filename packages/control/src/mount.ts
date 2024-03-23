import { Control } from './control';

export function mount(root: HTMLElement, app: Control | HTMLElement) {
  root.textContent = '';
  root.append(app instanceof Control ? app.node : app);
}
