import { BaseComponent } from '@control.ts/min';

import { defaultBlurAmount } from './constants';
import { generateSrcset } from './generate-srcset';
import type { Loader } from './types/loader';
import { createImageProps } from './utils/create-image-props';
import { hasPlaceholder, type OptimizedImagePropsWithPlaceholder } from './utils/has-placeholder';
import { keys } from './utils/keys';
import { validatePlaceholderFunction } from './utils/validate-placeholder';
import { validateProps } from './utils/validate-props';

export type Laziness = 'lazy' | 'eager';
export type Priority = 'low' | 'high' | 'auto';

/**
 * Optimized image props
 * @see {@link OptimizedImage}
 */
export interface BaseOptimizedImageProps {
  /**
   * Specifies Image width
   * **required** if `fill` is true, then it is not required
   */
  width: number;

  /**
   * Specifies Image height
   * **required** if `fill` is true, then it is not required
   */
  height: number;

  /**
   * Specifies image src.
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
   * Specifies an image placeholder, which is by default blurred by `15px`, represented as either a Base64 string or `true`.
   *
   * If set to `true`, a custom `loader` function must be provided. The result of this function will be used as the placeholder.
   */
  placeholder?: string;

  /**
   * Specifies the amount of blur applied to the placeholder image, measured in pixels.
   * The default value is 15 pixels.
   */
  blur?: number;

  /**
   * Specifies how the image should fill its container.
   * If set to `true`, the image will fill its container, and the `height` and `width` properties are no longer required.
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

  /**
   * Specifies the `srcset` attribute for the image. It accepts a string in the
   * format such as `'100w, 500w'` or `'0.5x, 2x'` and applies a loader function
   * if provided.
   *
   * If no loader loader function was provided, a default loader function will
   * be used.
   *
   * Default loader function converts base image source and descriptor to
   * `[baseImageSourceWithoutExtension]-[widthOrDensityDescriptor].[baseIamgeExtension]`.
   *
   * @example
   * OptimizedImage({
   *   src: 'path/to/some/image.webp',
   *   srcset: '100w, 200w'
   * })
   * // Result: `<img src="path/to/some/image.webp" srcset="path/to/some/image-100w.webp 100w, path/to/some/image-200w.webp 200w">`
   */
  srcset?: string;

  /**
   * Specifies sizes attribute for the image.
   */
  sizes?: string;

  /**
   * A function used to rewrite `srcset` attributes or create placeholder images.
   *
   * If this function is used to create a placeholder image, the `isPlaceholder`
   * field in the `ImageLoaderConfig` object will be set to `true`
   *
   */
  loader?: Loader;
}

interface LoaderProps {
  placeholder: true;
  loader: Loader;
}

/** @internal */
export interface WithFillProps {
  fill: true;
  width?: never;
  height?: never;
  srcset?: undefined;
}

interface WithSrcset {
  srcset: string;
  width: number;
}

/** @internal */
export type ReplaceOptimizedImageProps<T> = Omit<BaseOptimizedImageProps, keyof T> & T;

export type OptimizedImageProps =
  | ReplaceOptimizedImageProps<LoaderProps>
  | ReplaceOptimizedImageProps<WithSrcset>
  | ReplaceOptimizedImageProps<WithFillProps>
  | BaseOptimizedImageProps;

const createPlaceholder = (img: BaseComponent<HTMLImageElement>, placeholder: string, blur?: number) => {
  const styles: Partial<CSSStyleDeclaration> = {
    filter: `blur(${blur ?? defaultBlurAmount}px)`,
    backgroundImage: `url(${placeholder})`,
    backgroundPosition: '50%, 50%',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    overflow: 'hidden',
  };

  img.stylize(styles);

  return () => {
    img.unstylize(...keys(styles));
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

const getPlaceholderUrl = (props: OptimizedImagePropsWithPlaceholder) => {
  return props.placeholder === true
    ? validatePlaceholderFunction(props.loader, {
        src: props.src,
        isPlaceholder: true,
        widthAsNumber: props.width ?? 0,
      })
    : props.placeholder;
};

/**
 * Optimized image component which enforces best practices for loading images.
 * Warns if image is distorted and shows how to fix it.
 * Make sure to add `<link rel="preload" as="image" href="<image_src_here">` in <head> if the image has high priority.
 * @see {@link OptimizedImageProps}
 * @returns new `OptimizedImage`
 *
 * @example
 * OptimizedImage({
 *   src: 'path/to/some/kitty.webp',
 *   width: 500,
 *   height: 500,
 *   alt: 'cute kitty image'
 * })
 */
export const OptimizedImage = (props: OptimizedImageProps) => {
  const { src, laziness = 'lazy', width, height, alt, blur, fill: isFill, srcset, sizes } = validateProps(props);

  const img = new BaseComponent<OptimizedImageElement>({
    src,
    width,
    height,
    alt,
    sizes,
    ...createImageProps(laziness),
  });

  if (srcset) {
    img.node.srcset = generateSrcset(src, srcset, width);
  }

  if (hasPlaceholder(props)) {
    img.once('load', createPlaceholder(img, getPlaceholderUrl(props), blur));
  }

  if (isFill) {
    fill(img);
  } else {
    lazyAssertNoDistortion(img, width, height);
  }

  return img;
};
