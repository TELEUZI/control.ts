import type { BaseComponent } from '@control.ts/signals';
import { $ } from '@control.ts/signals';
import { clientRouter } from '@control.ts/ssr/client';

export const Outlet = (initialComponent?: BaseComponent | null) => {
  const currentComponent = $<BaseComponent | null>(initialComponent || null);

  if (typeof window !== 'undefined') {
    clientRouter.onNavigate<BaseComponent>((newComponent) => {
      currentComponent.value = newComponent;
    });
  }

  // BaseComponent natively renders a Signal<BaseComponent | null>
  return currentComponent;
};
