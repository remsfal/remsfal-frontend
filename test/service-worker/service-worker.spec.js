import {describe, it, expect, afterEach, vi} from 'vitest';
import './setupMocks.js';

import '../../public/service-worker.js';

describe('Service Worker Tests', () => {
  afterEach(() => {
    // Only clear mocks created in individual tests
    vi.clearAllMocks();
  });

  it('should listen for install event', () => {
    expect(globalThis.eventListeners.install).toBeDefined();
    expect(globalThis.eventListeners.install.length).toBeGreaterThan(0);
  });

  it('should cache files during install event', async () => {
    const cachesOpenStub = globalThis.caches.open;
    const addAllStub = vi.fn().mockResolvedValue();

    cachesOpenStub.mockResolvedValue({ addAll: addAllStub });

    const installEvent = {waitUntil: vi.fn(),};

    const installListener = globalThis.eventListeners.install[0];
    installListener(installEvent);

    // eslint-disable-next-line no-undef
    await new Promise((resolve) => setImmediate(resolve));

    // Assertions
    expect(cachesOpenStub).toHaveBeenCalledOnce();
    expect(cachesOpenStub).toHaveBeenCalledWith('remsfal-v1');
    expect(addAllStub).toHaveBeenCalledOnce();
    expect(installEvent.waitUntil).toHaveBeenCalledOnce();

    const expectedFiles = [
      '/',
      '/index.html',
      '/manifest.json',
      '/styles.css',
      '/script.js',
      '/favicon.ico',
      '/android-chrome-192x192.png',
      '/android-chrome-512x512.png',
    ];
    expect(addAllStub).toHaveBeenCalledWith(expectedFiles);
  });

  it('should listen for activate event', () => {
    expect(globalThis.eventListeners.activate).toBeDefined();
    expect(globalThis.eventListeners.activate.length).toBeGreaterThan(0);
  });

  it('should delete old caches during activate event', async () => {
    const cachesKeysStub = globalThis.caches.keys;
    cachesKeysStub.mockResolvedValue(['old-cache-v1', 'old-cache-v2']);

    const deleteStub = globalThis.caches.delete;
    deleteStub.mockResolvedValue(true);

    const activateEvent = {waitUntil: vi.fn(),};

    const activateListener = globalThis.eventListeners.activate[0];
    activateListener(activateEvent);

      // eslint-disable-next-line no-undef
    await new Promise((resolve) => setImmediate(resolve));

    // Assertions
    expect(cachesKeysStub).toHaveBeenCalledOnce();
    expect(deleteStub).toHaveBeenCalledTimes(2);
    expect(deleteStub).toHaveBeenCalledWith('old-cache-v1');
    expect(deleteStub).toHaveBeenCalledWith('old-cache-v2');
    expect(activateEvent.waitUntil).toHaveBeenCalledOnce();
  });

  it('should handle fetch events with cache fallback', async () => {
    const fetchStub = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('mocked network response'));

    const cacheMock = {
      put: vi.fn().mockResolvedValue(),
      match: vi.fn().mockResolvedValue(null),
    };
    globalThis.caches.open.mockResolvedValue(cacheMock);

    const absoluteUrl = 'https://example.com/test-resource';
    const event = {
      request: new Request(absoluteUrl),
      respondWith: vi.fn(),
    };

    const fetchListener = globalThis.eventListeners.fetch[0];
    fetchListener(event);

    // eslint-disable-next-line no-undef
    await new Promise((resolve) => setImmediate(resolve));

    expect(fetchStub).toHaveBeenCalledWith(event.request);
    expect(cacheMock.put).toHaveBeenCalled();
    expect(event.respondWith).toHaveBeenCalled();
  });

  it('should handle sync events with tag "sync-projects"', async () => {
    const getAllProjectsMock = vi
      .fn()
      .mockResolvedValue([{ title: 'Offline Project', createdAt: 123456 }]
    );
    globalThis.getAllProjects = getAllProjectsMock;

    const deleteProjectMock = vi.fn().mockResolvedValue();
    globalThis.deleteProject = deleteProjectMock;

    const fetchStub = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true });

    const syncEvent = {
      tag: 'sync-projects',
      waitUntil: vi.fn().mockImplementation((promise) =>
        promise.then(
          () => {},
          () => {},
        ),
      ),
    };

    const syncListener = globalThis.eventListeners.sync[0];
    syncListener(syncEvent);

    // eslint-disable-next-line no-undef
    await new Promise((resolve) => setImmediate(resolve));

    // Assertions
    expect(syncEvent.waitUntil).toHaveBeenCalled();
    expect(getAllProjectsMock).toHaveBeenCalledOnce();
    expect(deleteProjectMock).toHaveBeenCalledOnce();
    expect(fetchStub).toHaveBeenCalledOnce();
    expect(fetchStub).toHaveBeenCalledWith(expect.stringContaining('/api/v1/projects'), expect.any(Object));
  });
});
