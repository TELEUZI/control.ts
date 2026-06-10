import { describe, expect, it, vi } from 'vitest';

import { clientRouter, hydrateClient } from '../client';

describe('clientRouter', () => {
  it('should initialize with default warnings for navigate', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await clientRouter.navigate('/test');
    expect(consoleSpy).toHaveBeenCalledWith('Router not initialized');
    consoleSpy.mockRestore();
  });

  it('should initialize with default warnings for prefetch', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await clientRouter.prefetch('/test');
    expect(consoleSpy).toHaveBeenCalledWith('Router not initialized');
    consoleSpy.mockRestore();
  });
});

describe('hydrateClient', () => {
  it('should be a function', () => {
    expect(typeof hydrateClient).toBe('function');
  });
});
