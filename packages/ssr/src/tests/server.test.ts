import { describe, expect, it } from 'vitest';

import { startSSRServer } from '../server';

describe('startSSRServer', () => {
  it('should be a function', () => {
    expect(typeof startSSRServer).toBe('function');
  });
});
