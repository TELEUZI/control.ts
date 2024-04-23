import { BaseComponent } from '@control.ts/min';

import { createImageProps } from './utils/create-image-props';

export type Laziness = 'lazy' | 'eager';
export type Priority = 'low' | 'high' | 'auto';

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
}

export const OptimizedImage = ({ src, laziness = 'lazy', width, height, alt }: OptimizedImageProps) => {
  const img = new BaseComponent<HTMLImageElement & { fetchPriority: Priority }>({
    src,
    width,
    height,
    tag: 'img',
    alt,
    ...createImageProps(laziness),
  });

  return img;
};
