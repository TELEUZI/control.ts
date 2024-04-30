export interface Metrics {
  width: number;
  height: number;
}

export const wrap = (width: number, height: number): Metrics => ({ width, height });

export const ratio = (metrics: Metrics) => metrics.width / metrics.height;

export const flatRatio = (width: number, height: number) => width / height;
