import { $, BaseComponent, div, effect } from '@control.ts/signals';
import { clientRouter } from '@control.ts/ssr/client';

import { Header } from './components/header/header';

const isRouting = $(false);

if (typeof window !== 'undefined') {
  clientRouter.subscribe((navigating) => {
    isRouting.value = navigating;
  });
}

const GlobalLoader = () => {
  const loader = div({
    style: {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '4px',
      backgroundColor: '#E50914',
      zIndex: '9999',
    },
  });

  if (typeof window !== 'undefined') {
    effect(() => {
      loader.style.display = isRouting.value ? 'block' : 'none';
    });
  } else {
    loader.style.display = 'none';
  }

  return loader;
};

import { Outlet } from './components/outlet/outlet';

export class PageWrapperComponent extends BaseComponent {
  constructor(initialComponent?: BaseComponent) {
    super(
      {
        className: 'page-wrapper',
      },
      GlobalLoader(),
      Header(),
      Outlet(initialComponent),
    );
  }
}

export const PageWrapper = (initialComponent?: BaseComponent) => new PageWrapperComponent(initialComponent);
