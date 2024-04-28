import type { OptimizedImageProps } from '../optimized-image';

export const validateMetrics = (props: OptimizedImageProps) => {
  if (!props.width || !props.height) {
    throw new Error('width and height should be provided when fill is false.');
  }

  if (props.width <= 0 || props.height <= 0) {
    throw new Error('Image height and width should be at least 1px or fill should be set to true');
  }

  return props;
};
