import { clearProjects } from '@/helper/indexeddb';

// Shared with the service worker (src/sw.ts), which owns the runtime cache itself.
export const RUNTIME_CACHE_PREFIX = 'remsfal-runtime-';

/**
 * Removes all user-specific data the client keeps outside of memory: the service
 * worker's runtime cache and the IndexedDB offline queue. Must be called whenever
 * the session ends (logout, account deletion, non-renewable session). Errors are
 * only logged so that the clean-up can never block the logout itself.
 */
export async function clearUserClientData(): Promise<void> {
  await Promise.all([clearRuntimeCaches(), clearOfflineQueue()]);
}

async function clearRuntimeCaches() {
  if (!('caches' in globalThis)) {
    return;
  }
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((cacheName) => cacheName.startsWith(RUNTIME_CACHE_PREFIX))
        .map((cacheName) => caches.delete(cacheName)),
    );
  } catch (error) {
    console.error('Failed to clear runtime caches:', error);
  }
}

async function clearOfflineQueue() {
  try {
    await clearProjects();
  } catch (error) {
    console.error('Failed to clear offline project queue:', error);
  }
}
