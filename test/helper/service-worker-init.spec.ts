import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  registerServiceWorker,
  enableBackgroundSync,
  addOnlineEventListener,
} from '@/helper/service-worker-init';

describe('Service Worker Initialization', () => {
  beforeEach(() => {
    vi.restoreAllMocks(); // Restore mocks for clean state before each test
    process.env.VITE_SERVICE_WORKER_ENABLED = 'true';
  });

  describe('registerServiceWorker', () => {
    beforeEach(() => {
      vi.stubGlobal('navigator', {
        serviceWorker: {
          register: vi.fn().mockResolvedValue({ scope: '/service-worker.js' }),
        },
      });
      vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should not call register if serviceWorker is not supported', () => {
      delete navigator.serviceWorker; // Simulate unsupported Service Worker
      registerServiceWorker();
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should register service worker when enabled', async () => {
      vi.stubGlobal('import.meta', { env: { VITE_SERVICE_WORKER_ENABLED: 'true' } });

      await registerServiceWorker();

      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/service-worker.js');
    });
  });

  describe('enableBackgroundSync', () => {
    beforeEach(() => {
      vi.stubGlobal('navigator', {
        serviceWorker: {
          ready: Promise.resolve({
            sync: {
              register: vi.fn().mockResolvedValue(undefined),
            },
          }),
        },
      });
      vi.stubGlobal('window', { SyncManager: vi.fn() });
      vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should not call sync registration if serviceWorker is not supported', async () => {
      delete navigator.serviceWorker;

      await enableBackgroundSync();

      expect(console.log).not.toHaveBeenCalled();
    });

    it('should not call sync registration if SyncManager is not supported', async () => {
      delete window.SyncManager;

      await enableBackgroundSync();

      const registration = await navigator.serviceWorker.ready;
      expect(registration.sync.register).not.toHaveBeenCalled();
    });

    it('should register background sync when SyncManager is available', async () => {
      await enableBackgroundSync();

      const registration = await navigator.serviceWorker.ready;
      expect(registration.sync.register).toHaveBeenCalledWith('sync-projects');
    });
  });

  describe('addOnlineEventListener', () => {
    beforeEach(() => {
      vi.stubGlobal('window', {
        addEventListener: vi.fn(),
      });
      vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    it('should add an event listener for online events', () => {
      addOnlineEventListener();

      expect(window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    });
  });
});
