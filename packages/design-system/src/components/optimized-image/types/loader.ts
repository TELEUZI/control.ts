/**
 * Props for image loader function
 *
 * @see {@link Loader}
 */
export interface ImageLoaderConfig {
  /**
   * Supplied image source
   */
  src: string;

  /**
   * Image width as string, including pixel density characters or width
   * characters
   */
  width?: string;

  /**
   * parseFloat'ed `width`
   */
  widthAsNumber?: number;

  /**
   * Used to determine whether result of this function will be used as image
   * placeholder.
   */
  isPlaceholder?: boolean;
}

export type Loader = (config: ImageLoaderConfig) => string;
