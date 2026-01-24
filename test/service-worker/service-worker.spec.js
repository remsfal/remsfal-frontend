/* global global, setImmediate */
import {describe, it, expect, afterEach, vi} from 'vitest';
import './setupMocks.js';

import '../../public/service-worker.js';

describe('Service Worker Tests', () => {
  afterEach(() => {
    // Only clear mocks created in individual tests
    vi.clearAllMocks();
  });

  it('should listen for install event', () => {
    void expect(global.eventListeners.install).toBeDefined();
    void expect(global.eventListeners.install.length).toBeGreaterThan(0);
  });

  it('should cache files during install event', async () => {
    const cachesOpenStub = global.caches.open;
    const addAllStub = vi.fn().mockResolvedValue();

    cachesOpenStub.mockResolvedValue({ addAll: addAllStub });

    const installEvent = {waitUntil: vi.fn(),};

    const installListener = global.eventListeners.install[0];
    installListener(installEvent);

    await new Promise((resolve) => setImmediate(resolve));

    // Assertions
    void expect(cachesOpenStub).toHaveBeenCalledOnce();
    void expect(cachesOpenStub).toHaveBeenCalledWith('remsfal-v1');
    void expect(addAllStub).toHaveBeenCalledOnce();
    void expect(installEvent.waitUntil).toHaveBeenCalledOnce();

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
    void expect(addAllStub).toHaveBeenCalledWith(expectedFiles);
  });

  it('should listen for activate event', () => {
    void expect(global.eventListeners.activate).toBeDefined();
    void expect(global.eventListeners.activate.length).toBeGreaterThan(0);
  });

  it('should delete old caches during activate event', async () => {
    const cachesKeysStub = global.caches.keys;
    cachesKeysStub.mockResolvedValue(['old-cache-v1', 'old-cache-v2']);

    const deleteStub = global.caches.delete;
    deleteStub.mockResolvedValue(true);

    const activateEvent = {waitUntil: vi.fn(),};

    const activateListener = global.eventListeners.activate[0];
    activateListener(activateEvent);

    await new Promise((resolve) => setImmediate(resolve));

    // Assertions
    void expect(cachesKeysStub).toHaveBeenCalledOnce();
    void expect(deleteStub).toHaveBeenCalledTimes(2);
    void expect(deleteStub).toHaveBeenCalledWith('old-cache-v1');
    void expect(deleteStub).toHaveBeenCalledWith('old-cache-v2');

    void expect(activateEvent.waitUntil).toHaveBeenCalledOnce();
  });

  it('should handle fetch events with cache fallback', async () => {
    const fetchStub = vi.spyOn(global, 'fetch').mockResolvedValue(new Response('mocked network response'));

    const cacheMock = {
      put: vi.fn().mockResolvedValue(),
      match: vi.fn().mockResolvedValue(null),
    };
    global.caches.open.mockResolvedValue(cacheMock);

    const absoluteUrl = 'https://example.com/test-resource';
    const event = {
      request: new Request(absoluteUrl),
      respondWith: vi.fn(),
    };

    const fetchListener = global.eventListeners.fetch[0];
    fetchListener(event);

    await new Promise((resolve) => setImmediate(resolve));

    void expect(fetchStub).toHaveBeenCalledWith(event.request);
    void expect(cacheMock.put).toHaveBeenCalled();
    void expect(event.respondWith).toHaveBeenCalled();
  });

  it('should handle sync events with tag "sync-projects"', async () => {
    const getAllProjectsMock = vi
      .fn()
      .mockResolvedValue([{ title: 'Offline Project', createdAt: 123456 }]);
    global.getAllProjects = getAllProjectsMock;

    const deleteProjectMock = vi.fn().mockResolvedValue();
    global.deleteProject = deleteProjectMock;

    const fetchStub = vi.spyOn(global, 'fetch').mockResolvedValue({ ok: true });

    const syncEvent = {
      tag: 'sync-projects',
      waitUntil: vi.fn().mockImplementation((promise) =>
        promise.then(
          () => {},
          () => {},
        ),
      ),
    };

    const syncListener = global.eventListeners.sync[0];
    syncListener(syncEvent);

    await new Promise((resolve) => setImmediate(resolve));

    // Assertions
    void expect(syncEvent.waitUntil).toHaveBeenCalled();
    void expect(getAllProjectsMock).toHaveBeenCalledOnce();
    void expect(deleteProjectMock).toHaveBeenCalledOnce();
    void expect(fetchStub).toHaveBeenCalledOnce();
    void expect(fetchStub).toHaveBeenCalledWith(expect.stringContaining('/api/v1/projects'), expect.any(Object));
  });
});
