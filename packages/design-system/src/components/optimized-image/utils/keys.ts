/**
 * Helper function to remove unnecessary type assertions when using Object.keys
 * because it returns `string[]`
 * @param obj Object that has only string keys and unknown values
 * @returns Array of keys of `obj`
 * @internal
 */
export const keys = <T extends Record<string, unknown>>(obj: T): (keyof T)[] => Object.keys(obj);
