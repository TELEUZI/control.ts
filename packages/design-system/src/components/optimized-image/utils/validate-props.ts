import type { OptimizedImageProps } from '../optimized-image';
import { validateDimensions } from './validate-metrics';
import { validatePlaceholder } from './validate-placeholder';
import { validateSrcset } from './validate-srcset';

/** @internal */
export const validateProps = (props: OptimizedImageProps) => {
  if (!props.fill) {
    validateDimensions({ width: props.width, height: props.height });
  }

  if (props.placeholder && typeof props.placeholder === 'string') {
    validatePlaceholder(props.placeholder);
  }

  if (props.srcset) {
    validateSrcset(props.src, props.srcset);
  }

  return props;
};
