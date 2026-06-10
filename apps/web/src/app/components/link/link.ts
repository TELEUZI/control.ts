import type { ElementFnProps } from '@control.ts/signals';
import { a } from '@control.ts/signals';
import { clientRouter } from '@control.ts/ssr/client';

export const Link = (
  props: ElementFnProps<HTMLAnchorElement> & {
    onclick?: () => void;
    onmouseenter?: () => void;
  },
  ...children: HTMLElement[]
) => {
  // Strip out any camelCase event handlers to avoid duplication if we handle them
  const { onclick, onmouseenter, ...rest } = props;

  return a(
    {
      ...rest,
      onmouseenter: function (this: GlobalEventHandlers) {
        if (props.href) {
          // Prefetch on hover!
          clientRouter.prefetch(props.href).catch(console.error);
        }
        if (onmouseenter) {
          onmouseenter();
        }
      },
      onclick: function (this: GlobalEventHandlers, e: MouseEvent) {
        if (props.target === '_blank' || e.ctrlKey || e.metaKey) {
          return; // Let browser handle external links or new tabs
        }

        if (props.href && props.href.startsWith('/')) {
          e.preventDefault();
          clientRouter.navigate(props.href);
        }

        if (onclick) {
          onclick();
        }
      },
    },
    ...children,
  );
};
