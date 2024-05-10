import type { MakeRequired } from '../../../types/make-required';
import type { OptimizedImageProps } from '../optimized-image';

export type OptimizedImagePropsWithPlaceholder = MakeRequired<OptimizedImageProps, 'placeholder'>;

export const hasPlaceholder = (props: OptimizedImageProps): props is OptimizedImagePropsWithPlaceholder =>
  Boolean(props.placeholder);
