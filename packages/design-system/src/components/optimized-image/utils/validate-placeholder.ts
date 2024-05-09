import { DesignSystemError } from '../../../utils/design-system-error';
import { dataUrlLengthError, dataUrlLengthWarn } from '../constants';
import type { ImageLoaderConfig, Loader } from '../types/loader';
import { isBase64Url } from './is-base-64-url';

/** @internal */
export const validatePlaceholder = (placeholder: string) => {
  if (!isBase64Url(placeholder)) {
    throw new DesignSystemError('The placeholder should be a valid data URL string.');
  }
  if (placeholder.length >= dataUrlLengthError) {
    throw new DesignSystemError('The data URL for the image is too long.');
  }
  if (placeholder.length >= dataUrlLengthWarn) {
    console.warn('The data URL for the image is long. Consider reducing its size.');
  }
};

/** @internal */
export const validateFn = (loader: Loader, config: ImageLoaderConfig) => validatePlaceholder(loader(config));
