/** @internal */
export interface ImageLoaderConfig {
  src: string;
  width: string;
  widthAsNumber: number;
  isPlaceholder?: boolean;
}

/** @internal */
export type Loader = (config: ImageLoaderConfig) => string;
