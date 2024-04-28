import { BaseComponent } from '@control.ts/min';

import { DefaultBlurAmount } from './constants';
import { createImageProps } from './utils/create-image-props';
import { keys } from './utils/keys';
import { validateProps } from './utils/validate-props';

export type Laziness = 'lazy' | 'eager';
export type Priority = 'low' | 'high' | 'auto';

export interface OptimizedImageProps {
  /**
   * Image width
   */
  width?: number;

  /**
   * Image height
   */
  height?: number;

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
  blurAmount?: number;

  /**
   * Specifies image filling.
   * if set to true, height and width are no longer required
   */
  fill?: boolean;
}

/** @internal */
export const createPlaceholder = (img: BaseComponent<HTMLImageElement>, placeholder: string, blur?: number) => {
  const styles: Partial<CSSStyleDeclaration> = {
    filter: `blur(${blur ?? DefaultBlurAmount}px)`,
    backgroundImage: `url(${placeholder})`,
    backgroundPosition: '50%, 50%',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    overflow: 'hidden',
  };

  img.stylize(styles);

  return () => {
    keys(styles).forEach((style) => img.unstylize(style));
  };
};

/** @internal */
const fill = (img: BaseComponent<HTMLImageElement>) => {
  img.stylize({
    width: '100%',
    height: '100%',
    inset: '0',
    position: 'absolute',
  });
};

export type OptimizedImageElement = HTMLImageElement & { fetchPriority: Priority };

/**
 * Optmized image component which enforces best practices for loading images.
 * @returns new `OptimizedImage`
 */
export const OptimizedImage = (props: OptimizedImageProps) => {
  const {
    src,
    laziness = 'lazy',
    width,
    height,
    alt,
    blurAmount,
    fill: isFill,
    placeholder: placeholderImg,
  } = validateProps(props);

  const img = new BaseComponent<OptimizedImageElement>({
    src,
    width,
    height,
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
