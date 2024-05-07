import { BaseComponent } from '@control.ts/min';

import { DefaultBlurAmount } from './constants';
import { generateSrcset } from './generate-srcset';
import type { Loader } from './types/loader';
import { createImageProps } from './utils/create-image-props';
import { keys } from './utils/keys';
import { validateProps } from './utils/validate-props';

export type Laziness = 'lazy' | 'eager';
export type Priority = 'low' | 'high' | 'auto';

/**
 * Optimzied image props
 * @see {@link OptimizedImage}
 */
export interface OptimizedImageProps {
  /**
   * Specifies Image width
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
   * - `lazy` image will load only if visible.
   * - `eager` non lazy image.
   *
   * `lazy` is the default value.
   */
  laziness?: Laziness;

  /**
   * Specifies image alt attribute
   */
  alt: string;

  /**
   * Specifies image placeholder which is by default blurred by `15px`
   * which is `Base64` string
   */
  placeholder?: string;

  /**
   * blur amount for the placeholder image specified pixels
   * default value is 15.
   */
  blur?: number;

  /**
   * Specifies image filling.
   * if set to true, height and width are no longer required
   */
  fill?: boolean;

  /**
   * Specifies the `srcset` attribute for an image. If only sizes are provided,
   * this function converts them into a valid `srcset` format and applies any specified
   * loader to transform each src-size pair.
   *
   * If no loader is provided, a default loader function will be used. This function
   * converts image sources to a format like `[baseImageSrcWithoutExt]-[size].[ext]`.
   */
  srcset?: string;

  /** Specifies sizes attribute for the image.
   *
   * @see MDN reference {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/sizes}
   */
  sizes?: string;

  /**
   * Function used to rewrite `srcset` attributes.
   *
   * The default loader function converts the source and size to a string format
   * like `[baseImageSrcWithoutExt]-[size].[ext]`.
   */
  loader?: Loader;
}

const createPlaceholder = (img: BaseComponent<HTMLImageElement>, placeholder: string, blur?: number) => {
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

const fill = (img: BaseComponent<HTMLImageElement>) => {
  img.stylize({
    width: '100%',
    height: '100%',
    inset: '0',
    position: 'absolute',
  });
};

/**
 * HTMLImageElement that has fetchpriority because typescript does not include
 * fetchpriority in standart HTMLImageElement
 */
export type OptimizedImageElement = HTMLImageElement & { fetchpriority: Priority };

/** @internal */
export const lazyAssertNoDistortion = (img: BaseComponent<OptimizedImageElement>, width: number, height: number) => {
  img.once('load', () =>
    import('./utils/distortion.js').then((module) => module.assertNoDistortion(img, width, height)),
  );
};

/**
 * Optmized image component which enforces best practices for loading images.
 * Warns if image is distroted and shows how to fix it.
 * @see {@link OptimizedImageProps}
 * @returns new `OptimizedImage`
 */
export const OptimizedImage = (props: OptimizedImageProps) => {
  const {
    src,
    laziness = 'lazy',
    width,
    height,
    alt,
    blur,
    fill: isFill,
    placeholder,
    srcset,
    sizes,
  } = validateProps(props);

  const img = new BaseComponent<OptimizedImageElement>({
    src,
    width,
    height,
    alt,
    sizes,
    ...createImageProps(laziness),
  });

  if (srcset) {
    img.node.srcset = generateSrcset(src, srcset);
  }

  if (sizes) {
    img.node.sizes = sizes;
  }

  if (placeholder) {
    img.once('load', createPlaceholder(img, placeholder, blur));
  }

  if (isFill) {
    fill(img);
  } else {
    lazyAssertNoDistortion(img, width!, height!);
  }

  return img;
};