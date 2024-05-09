import type { Loader } from './types/loader';
import { widthRegexp } from './utils/validate-srcset';

const isNotEmptyString = (string: string) => string.trim() !== '';

const defaultLoader: Loader = (config) => {
  const index = config.src.lastIndexOf('.');

  return config.src.slice(0, index) + `-${config.width}` + config.src.slice(index);
};

const createSizeToSrcset = (src: string, imageWidth: number, loader: Loader = defaultLoader) => {
  const isWidthSrcset = widthRegexp.test(src);

  return (size: string) => {
    const width = size.trim();
    const widthAsNumber = isWidthSrcset ? parseFloat(size) : parseFloat(size) * imageWidth;

    return `${loader({ src, width, widthAsNumber })} ${width}`;
  };
};

/** @internal */
export const generateSrcset = (src: string, sizes: string, width: number, loader?: Loader) => {
  const convertSizeToSrcset = createSizeToSrcset(src, width, loader);

  return sizes
    .split(',')
    .reduce<string[]>((acc, curr) => (isNotEmptyString(curr) ? acc.concat(convertSizeToSrcset(curr)) : acc), [])
    .join(', ');
};
