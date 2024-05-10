/** @internal */
export const formatError = (text: string) => {
  return `[control.ts] [design-system] ${text}`;
};

/** @internal */
export class DesignSystemError extends Error {
  constructor(message?: string) {
    super(formatError(message ?? ''));
  }
}
