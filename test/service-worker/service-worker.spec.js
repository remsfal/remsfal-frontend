import './setupMocks.js';
import { expect, vi, afterEach } from 'vitest';

import '../../public/service-worker.js';

describe('Service Worker Tests', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should listen for install event', () => {
    expect(self.addEventListener).toHaveBeenCalledWith('install', expect.any(Function));
  });

  it('should cache files during install event', async () => {
    const addAllStub = vi.fn().mockResolvedValue();
    const cachesOpenStub = vi.fn().mockResolvedValue({ addAll: addAllStub });
    global.caches.open = cachesOpenStub;

    const installEvent = {
      waitUntil: vi.fn(),
    };

    const installListener = self.addEventListener.mock.calls[0][1];
    installListener(installEvent);

    await new Promise((resolve) => setImmediate(resolve));

    // Assertions
    expect(cachesOpenStub).toHaveBeenCalledTimes(1);
    expect(cachesOpenStub).toHaveBeenCalledWith('remsfal-v1');
    expect(addAllStub).toHaveBeenCalledTimes(1);
    expect(installEvent.waitUntil).toHaveBeenCalledTimes(1);

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
    expect(self.addEventListener).toHaveBeenCalledWith('activate', expect.any(Function));
  });

  it('should delete old caches during activate event', async () => {
    const cachesKeysStub = vi.fn().mockResolvedValue(['old-cache-v1', 'old-cache-v2']);
    global.caches.keys = cachesKeysStub;

    const deleteStub = vi.fn().mockResolvedValue(true);
    global.caches.delete = deleteStub;

    const activateEvent = {
      waitUntil: vi.fn(),
    };

    const activateListener = self.addEventListener.mock.calls[1][1];
    activateListener(activateEvent);

    await new Promise((resolve) => setImmediate(resolve));

    // Assertions
    expect(cachesKeysStub).toHaveBeenCalledTimes(1);
    expect(deleteStub).toHaveBeenCalledTimes(2);
    expect(deleteStub).toHaveBeenCalledWith('old-cache-v1');
    expect(deleteStub).toHaveBeenCalledWith('old-cache-v2');
    expect(self.addEventListener).toHaveBeenCalledWith('install', expect.any(Function));
    expect(activateEvent.waitUntil).toHaveBeenCalledTimes(1);
  });

  it('should handle fetch events with cache fallback', async () => {
    const fetchStub = vi.spyOn(global, 'fetch').mockResolvedValue(new Response('mocked network response'));

    const cacheMock = {
      put: vi.fn().mockResolvedValue(),
      match: vi.fn().mockResolvedValue(null),
    };
    global.caches.open = vi.fn().mockResolvedValue(cacheMock);

    const absoluteUrl = 'https://example.com/test-resource';
    const event = {
      request: new Request(absoluteUrl),
      respondWith: vi.fn(),
    };

    const fetchListener = self.addEventListener.mock.calls[2][1];
    fetchListener(event);

    await new Promise((resolve) => setImmediate(resolve));

    expect(fetchStub).toHaveBeenCalledWith(event.request);
    expect(cacheMock.put).toHaveBeenCalled();
    expect(event.respondWith).toHaveBeenCalled();
  });

  it('should handle sync events with tag "sync-projects"', async () => {
    const getAllProjectsMock = vi.fn().mockResolvedValue([{ title: 'Offline Project', createdAt: 123456 }]);
    global.getAllProjects = getAllProjectsMock;

    const deleteProjectMock = vi.fn().mockResolvedValue();
    global.deleteProject = deleteProjectMock;

    const fetchStub = vi.spyOn(global, 'fetch').mockResolvedValue({ ok: true });

    const syncEvent = {
      tag: 'sync-projects',
      waitUntil: vi.fn().callsFake((promise) =>
        promise.then(() => {}, () => {}),
      ),
    };

    const syncListener = self.addEventListener.mock.calls[3][1];
    syncListener(syncEvent);

    await new Promise((resolve) => setImmediate(resolve));

    // Assertions
    expect(getAllProjectsMock).toHaveBeenCalledTimes(1);
    expect(deleteProjectMock).toHaveBeenCalledTimes(1);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });
});
