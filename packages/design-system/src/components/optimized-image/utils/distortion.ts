import type { BaseComponent } from '@control.ts/min';

import type { OptimizedImageElement } from '../optimized-image';
import { findClosestToRatio, flatRatio, type Metrics, wrap } from './metrics';
import { objectFromEntries } from './object-from-entries';

const sides = ['left', 'right', 'top', 'bottom'] as const;

type Padding = Record<(typeof sides)[number], number>;

const getPadding = (computed: CSSStyleDeclaration): Padding => {
  return objectFromEntries(sides.map((side) => [side, parseFloat(computed.getPropertyValue(`padding-${side}`))]));
};

/** @internal */
export const getComputedMetrics = (computed: CSSStyleDeclaration): Metrics => {
  const width = parseFloat(computed.getPropertyValue('width'));
  const height = parseFloat(computed.getPropertyValue('height'));

  if (computed.getPropertyValue('box-sizing') === 'border-box') {
    const padding = getPadding(computed);

    return wrap(width - padding.right + padding.left, height - padding.top - padding.bottom);
  }

  return wrap(width, height);
};

export const assertNoDistortion = (img: BaseComponent<OptimizedImageElement>, width: number, height: number) => {
  img.once('load', () => {
    // const computed = window.getComputedStyle(img.node);
    // const metrics = getComputedMetrics(computed);
    //
    // const renderedRatio = ratio(metrics);
    // const nonZeroRenderedDimensions = metrics.width !== 0 && metrics.height !== 0;
    const intrinsicWidth = img.node.naturalWidth;
    const intrinsicHeight = img.node.naturalHeight;
    const intrinsicAspectRatio = flatRatio(intrinsicWidth, intrinsicHeight);

    const suppliedRatio = flatRatio(width, height);

    const inaccurateDimensions = Math.abs(suppliedRatio - intrinsicAspectRatio) > 0.1;
    // const stylingDistortion = nonZeroRenderedDimensions && Math.abs(intrinsicAspectRatio - renderedRatio) > 0.1;

    if (inaccurateDimensions) {
      const closest = findClosestToRatio(width, height, intrinsicAspectRatio);

      console.warn(
        `(${img.node.src}) The aspect ratio of the image does not match the aspect ratio indicated by height and width attributes.` +
          `\nSupplied: ${width}x${height} (ratio ${suppliedRatio})` +
          `\nIntrinsic: ${intrinsicWidth}x${intrinsicHeight} (ratio ${intrinsicAspectRatio})` +
          `\nTo fix this try changing width and height to ${closest.width} x ${closest.height}`,
      );
    }
  });
};
