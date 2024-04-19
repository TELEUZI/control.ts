import type { Control } from './control';

const componentMap = new WeakMap<Node, Control>();

export function initObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.removedNodes.forEach((node) => {
          if (componentMap.has(node)) {
            const component = componentMap.get(node);
            component?.destroy();
            componentMap.delete(node);
          }
        });
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

export function registerComponent<T extends Control>(component: T) {
  componentMap.set(component.node, component);
}

export function unregisterComponent<T extends Control>(component: T) {
  componentMap.delete(component.node);
}

export function getComponent<T extends Control>(node: Node): T | undefined {
  return componentMap.get(node) as T;
}
