/** @internal */
export interface Metrics {
  width: number;
  height: number;
}

/** @internal */
export const wrap = (width: number, height: number): Metrics => ({ width, height });

/** @internal */
export const ratio = (metrics: Metrics) => metrics.width / metrics.height;

/** @internal */
export const flatRatio = (width: number, height: number) => width / height;

/** @internal */
export const findClosestToRatio = (width: number, height: number, desiredRatio: number) => {
  const currentRatio = flatRatio(width, height);

  if (currentRatio === desiredRatio) {
    return wrap(width, height);
  }

  const diff = Math.abs(desiredRatio - currentRatio);

  if (currentRatio < desiredRatio) {
    const newWidth = width + diff;
    const newHeight = newWidth / desiredRatio;

    return wrap(newWidth, newHeight);
  }

  const newHeight = height + diff;
  const newWidth = newHeight * desiredRatio;

  return wrap(newWidth, newHeight);
};
