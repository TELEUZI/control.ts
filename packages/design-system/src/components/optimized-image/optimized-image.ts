import { BaseComponent } from '@control.ts/min';

import { createImageProps } from './utils/create-image-props';
import { isBase64Url } from './utils/is-base-64-url';

export type Laziness = 'lazy' | 'eager';
export type Priority = 'low' | 'high' | 'auto';

export const DefaultBlurAmount = 15;

export interface OptimizedImageProps {
  /**
   * Image width
   */
  width: number;

  /**
   * Image height
   */
  height: number;

  /**
   * Image src
   */
  src: string;

  /**
   * Specifies imagine laziness.
   * - `browser` default browser laziness
   * - `eager` non lazy image
   * - `intersection` lazy load image using `IntersectionObserver`
   */
  laziness?: Laziness;

  /**
   * Specifies image alt attribute
   */
  alt: string;

  /**
   * Specifies image placeholder which is blurred by `15px`
   * which is `Base64` string or a `boolean`
   */
  placeholder: string | boolean;
}

const createPlaceholder = (img: BaseComponent<HTMLImageElement>, placeholder: string) => {
  if (!isBase64Url(placeholder)) {
    throw new Error('placeholder should be valid base64 string');
  }

  img.stylize('backgroundImage', `url('${placeholder}')`);
  img.stylize('backgroundPosition', '0, 0');
  img.stylize('filter', `blur(${DefaultBlurAmount})`);

  return () => {
    img.unstylize('backgroundImage');
    img.unstylize('filter');
  };
};

/**
 * Optmized image component which enforces best practices for loading images.
 * @returns new `OptimizedImage`
 */
export const OptimizedImage = ({
  src,
  laziness = 'lazy',
  width,
  height,
  alt,
  placeholder: placeholderImg,
}: OptimizedImageProps) => {
  if (width <= 0 || height <= 0) {
    throw new Error('Image height and width should be at least 1px');
  }

  const img = new BaseComponent<HTMLImageElement & { fetchPriority: Priority }>({
    src,
    width,
    height,
    tag: 'img',
    alt,
    ...createImageProps(laziness),
  });

  if (typeof placeholderImg === 'string') {
    img.on('load', createPlaceholder(img, placeholderImg));
  }

  return img;
};
