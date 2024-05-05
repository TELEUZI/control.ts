import type { OptimizedImageProps } from '../optimized-image';
import { validateMetrics } from './validate-metrics';
import { validatePlaceholder } from './validate-placeholder';
import { validateSrcset } from './validate-srcset';

/** @internal */
export const validateProps = (props: OptimizedImageProps) => {
  if (!props.fill) {
    validateMetrics(props);
  }

  if (props.placeholder && typeof props.placeholder === 'string') {
    validatePlaceholder(props.placeholder);
  }

  if (props.srcset) {
    validateSrcset(props.srcset);
  }

  return props;
};
