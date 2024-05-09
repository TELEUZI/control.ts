import { DesignSystemError } from '../../../utils/design-system-error';
import type { Dimensions } from './deminsions';

/** @internal */
export const validateDimensions = (deminsions: Partial<Dimensions>) => {
  if (!deminsions.width || !deminsions.height) {
    throw new DesignSystemError('width and height should be provided when fill is false.');
  }

  if (deminsions.width <= 0 || deminsions.height <= 0) {
    throw new DesignSystemError('Image height and width should be at least 1px or fill should be set to true');
  }
};
