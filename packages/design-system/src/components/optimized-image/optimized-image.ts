import { BaseComponent } from '@control.ts/min';

import { createImageProps } from './utils/create-image-props';
import { isBase64Url } from './utils/is-base-64-url';

export type Laziness = 'lazy' | 'eager';
export type Priority = 'low' | 'high' | 'auto';

/**
 * Default blur radius of the CSS filter used on placeholder images
 * in pixels
 */
export const DefaultBlurAmount = 15;

export const DataUrlLengthWarn = 3_500;

export const DataUrlLengthError = 10_000;

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

  /**
   * blur amount for the placeholder image in px
   * by default it is 15px
   */
  blurAmount: number;
}

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

export const createPlaceholder = (img: BaseComponent<HTMLImageElement>, placeholder: string, blur?: number) => {
  const image = validatePlaceholder(placeholder);

  const styles: Partial<CSSStyleDeclaration> = {
    filter: `blur(${blur ?? DefaultBlurAmount}px)`,
    backgroundImage: `url(${image})`,
    backgroundPosition: '50%, 50%',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    overflow: 'hidden',
  };

  img.stylize(styles);

  return () => {
    Object.keys(styles).forEach((style) => img.unstylize(style as keyof CSSStyleDeclaration));
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
  blurAmount,
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
    img.on('load', createPlaceholder(img, placeholderImg, blurAmount));
  }

  return img;
};
