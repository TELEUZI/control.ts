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

/**
 * Warn data url length
 */
export const DataUrlLengthWarn = 3_500;

/**
 * Maximum dataurl image length
 */
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
   * - `lazy` default browser laziness
   * - `eager` non lazy image
   *
   * lazy by default
   */
  laziness?: Laziness;

  /**
   * Specifies image alt attribute
   */
  alt: string;

  /**
   * Specifies image placeholder which is by default blurred by `15px`
   * which is `Base64` string or a `boolean`
   */
  placeholder: string | boolean;

  /**
   * blur amount for the placeholder image in pixels
   * by default it is 15px
   */
  blurAmount: number;

  /**
   * Specifies image filling.
   * if set to true, height and width are no longer required
   */
  fill?: boolean;
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

const fill = (img: BaseComponent<HTMLImageElement>) => {
  img.stylize({
    width: '100%',
    height: '100%',
    inset: '0',
    position: 'absolute',
  });
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
  fill: isFill,
  placeholder: placeholderImg,
}: OptimizedImageProps) => {
  if ((width <= 0 || height <= 0) && !fill) {
    throw new Error('Image height and width should be at least 1px or fill should be set to true');
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

  if (isFill) {
    fill(img);
  }

  return img;
};
