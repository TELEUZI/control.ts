import { DesignSystemError } from '../../../utils/design-system-error';
import type { OptimizedImageProps } from '../optimized-image';

/** @internal */
export const validateMetrics = (props: OptimizedImageProps) => {
  if (!props.width || !props.height) {
    throw new DesignSystemError('width and height should be provided when fill is false.');
  }

  if (props.width <= 0 || props.height <= 0) {
    throw new DesignSystemError('Image height and width should be at least 1px or fill should be set to true');
  }

  return props;
};
