import { describe, expect, it } from 'vitest';

import { buildStaticPages } from '../prerender';

describe('buildStaticPages', () => {
  it('should be a function', () => {
    expect(typeof buildStaticPages).toBe('function');
  });
});
