import type { OptimizedImageProps } from '../optimized-image';
import { validatePlaceholder } from './validate-placeholder';

export const validateProps = (props: OptimizedImageProps) => {
  if ((props.width <= 0 || props.height <= 0) && !props.fill) {
    throw new Error('Image height and width should be at least 1px or fill should be set to true');
  }
  if (!props.src) {
    throw new Error('Image should have an src.');
  }

  if (props.placeholder && typeof props.placeholder === 'string') {
    validatePlaceholder(props.placeholder);
  }

  return props;
};
