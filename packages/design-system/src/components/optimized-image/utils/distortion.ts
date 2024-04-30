import type { BaseComponent } from '@control.ts/min';

import type { OptimizedImageElement } from '../optimized-image';
import { objectFromEntries } from './object-from-entries';

interface ComputedMetrics {
  width: number;
  height: number;
}

const sides = ['left', 'right', 'top', 'bottom'] as const;

type Padding = Record<(typeof sides)[number], number>;

const getPadding = (computed: CSSStyleDeclaration): Padding => {
  return objectFromEntries(sides.map((side) => [side, parseFloat(computed.getPropertyValue(`padding-${side}`))]));
};

/** @internal */
export const getComputedMetrics = (computed: CSSStyleDeclaration): ComputedMetrics => {
  const width = parseFloat(computed.getPropertyValue('width'));
  const height = parseFloat(computed.getPropertyValue('height'));

  if (computed.getPropertyValue('box-sizing') === 'border-box') {
    const padding = getPadding(computed);

    return {
      width: width - padding.right + padding.left,
      height: height - padding.top + padding.bottom,
    };
  }

  return { width, height };
};

const ratio = (computed: ComputedMetrics) => {
  return computed.width / computed.height;
};

export const assertNoDistortion = (img: BaseComponent<OptimizedImageElement>, width: number, height: number) => {
  img.once('load', () => {
    // const computed = window.getComputedStyle(img.node);
    // const metrics = getComputedMetrics(computed);
    //
    // const renderedRatio = ratio(metrics);
    // const nonZeroRenderedDimensions = metrics.width !== 0 && metrics.height !== 0;
    //
    const intrinsicWidth = img.node.naturalWidth;
    const intrinsicHeight = img.node.naturalHeight;
    const intrinsicAspectRatio = ratio({ width: intrinsicWidth, height: intrinsicHeight });

    const suppliedRatio = ratio({ width, height });

    const inaccurateDimensions = Math.abs(suppliedRatio - intrinsicAspectRatio) > 0.1;
    // const stylingDistortion = nonZeroRenderedDimensions && Math.abs(intrinsicAspectRatio - renderedRatio) > 0.1;

    if (inaccurateDimensions) {
      console.warn(
        `(${img.node.src}) The aspect ratio of the image does not match the aspect ratio indicated by height and width attributes.\n` +
          `Supplied: ${width}x${height} (ratio ${suppliedRatio})\n` +
          `Intrinsic: ${intrinsicWidth}x${intrinsicHeight} (ratio ${intrinsicAspectRatio})`,
      );
    }
  });
};
