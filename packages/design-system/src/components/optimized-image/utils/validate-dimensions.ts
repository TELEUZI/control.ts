import { DesignSystemError } from '../../../utils/design-system-error';
import type { Dimensions } from './deminsions';

/** @internal */
export const validateDimensions = (dimensions: Partial<Dimensions>) => {
  if (!(dimensions.width && dimensions.height)) {
    throw new DesignSystemError('width and height should be provided when fill is false.');
  }

  if (dimensions.width <= 0 || dimensions.height <= 0) {
    throw new DesignSystemError('Image height and width should be at least 1px or fill should be set to true');
  }
};
