const isNotEmpty = (string: string) => string.trim() !== '';

/** @internal */
export type Loader = (src: string, size: string) => string;

const defaultLoader = (src: string, size: string) => {
  const index = src.lastIndexOf('.');

  return src.slice(0, index) + `-${size}` + src.slice(index);
};

const sizeToSrcset = (src: string, loader?: Loader) => (size: string) => {
  const trimmed = size.trim();

  return `${loader ? loader(src, trimmed) : defaultLoader(src, trimmed)} ${trimmed}`;
};

/** @internal */
export const generateSrcset = (src: string, sizes: string, loader?: Loader) => {
  return sizes.split(',').filter(isNotEmpty).map(sizeToSrcset(src, loader)).join(', ');
};
