import { DataUrlLengthError, DataUrlLengthWarn } from '../constants';
import { isBase64Url } from './is-base-64-url';

export const validatePlaceholder = (placeholder: string) => {
  if (!isBase64Url(placeholder)) {
    throw new Error('placeholder should be valid data url string.');
  }
  if (placeholder.length >= DataUrlLengthError) {
    throw new Error('Data url image is too long.');
  }
  if (placeholder.length >= DataUrlLengthWarn) {
    console.warn('long data url image. consider making it smaller');
  }

  return placeholder;
};
