const widthRegexp = /^((\s*\d+w\s*(,|$)){1,})$/;
const densityRegexp = /^((\s*\d+(\.\d+)?x\s*(,|$)){1,})$/;

/** @internal */
export const validateSrcset = (srcset: string | null | undefined) => {
  if (!srcset) {
    return;
  }

  const isValidWidth = widthRegexp.test(srcset);
  const isValidDensity = densityRegexp.test(srcset);

  const isValidSrcset = isValidWidth || isValidDensity;

  if (!isValidSrcset) {
    throw new Error(`invalid srcset`);
  }
};
