import { DesignSystemError } from '../../../utils/design-system-error';

/** @internal */
export const widthRegexp = /^((\s*\d+w\s*(,|$)){1,})$/;

/** @internal */
export const densityRegexp = /^((\s*\d+(\.\d+)?x\s*(,|$)){1,})$/;

/** @internal */
export const validateSrcset = (src: string, srcset?: string | null) => {
  if (!srcset) {
    return;
  }

  const isValidWidth = widthRegexp.test(srcset);
  const isValidDensity = densityRegexp.test(srcset);

  const isValidSrcset = isValidWidth || isValidDensity;

  if (!isValidSrcset) {
    throw new DesignSystemError(
      `${src} srcset has an invalid value (${srcset}). ` +
        `To fix this, supply srcset using comma-separated list of one or more width ` +
        `descriptors (e.g. "100w, 200w") or density descriptors (e.g. "1x, 2x").`,
    );
  }
};
