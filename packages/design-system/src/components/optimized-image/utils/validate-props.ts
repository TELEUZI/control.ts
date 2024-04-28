import type { OptimizedImageProps } from '../optimized-image';
import { validateMetrics } from './validate-metrics';
import { validatePlaceholder } from './validate-placeholder';

export const validateProps = (props: OptimizedImageProps) => {
  if (!props.fill) {
    validateMetrics(props);
  }

  if (props.placeholder && typeof props.placeholder === 'string') {
    validatePlaceholder(props.placeholder);
  }

  return props;
};
