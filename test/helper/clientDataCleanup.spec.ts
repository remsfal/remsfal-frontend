import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { clearUserClientData } from '@/helper/clientDataCleanup';
import { clearProjects } from '@/helper/indexeddb';

vi.mock('@/helper/indexeddb', () => ({ clearProjects: vi.fn() }));

describe('clearUserClientData', () => {
  let cachesMock: { keys: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    cachesMock = {
      keys: vi.fn().mockResolvedValue([
        'remsfal-runtime-v1',
        'remsfal-runtime-v2',
        'workbox-precache-v2-https://example.com/',
      ]),
      delete: vi.fn().mockResolvedValue(true),
    };
    vi.stubGlobal('caches', cachesMock);
    vi.mocked(clearProjects).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('deletes only the runtime caches and keeps the Workbox precache', async () => {
    await clearUserClientData();

    expect(cachesMock.delete).toHaveBeenCalledTimes(2);
    expect(cachesMock.delete).toHaveBeenCalledWith('remsfal-runtime-v1');
    expect(cachesMock.delete).toHaveBeenCalledWith('remsfal-runtime-v2');
    expect(cachesMock.delete).not.toHaveBeenCalledWith('workbox-precache-v2-https://example.com/');
  });

  it('clears the IndexedDB offline project queue', async () => {
    await clearUserClientData();

    expect(clearProjects).toHaveBeenCalledOnce();
  });

  it('does not reject when the Cache Storage fails', async () => {
    cachesMock.keys.mockRejectedValue(new Error('SecurityError'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(clearUserClientData()).resolves.toBeUndefined();

    expect(clearProjects).toHaveBeenCalledOnce();
    expect(errorSpy).toHaveBeenCalledWith('Failed to clear runtime caches:', expect.any(Error));
    errorSpy.mockRestore();
  });

  it('does not reject when IndexedDB fails', async () => {
    vi.mocked(clearProjects).mockRejectedValue(new Error('IndexedDB unavailable'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(clearUserClientData()).resolves.toBeUndefined();

    expect(cachesMock.delete).toHaveBeenCalledTimes(2);
    expect(errorSpy).toHaveBeenCalledWith('Failed to clear offline project queue:', expect.any(Error));
    errorSpy.mockRestore();
  });

  it('skips the cache clean-up when the Cache Storage API is not available', async () => {
    vi.unstubAllGlobals();
    // `caches` is a required property on the global type, hence the cast.
    const originalCaches = (globalThis as { caches?: unknown }).caches;
    delete (globalThis as { caches?: unknown }).caches;

    try {
      await expect(clearUserClientData()).resolves.toBeUndefined();
      expect(clearProjects).toHaveBeenCalledOnce();
    } finally {
      if (originalCaches !== undefined) {
        (globalThis as { caches?: unknown }).caches = originalCaches;
      }
    }
  });
});
