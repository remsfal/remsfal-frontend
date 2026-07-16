import {describe, it, expect, afterEach, vi} from 'vitest';
import './setupMocks';

const mockPrecacheAndRoute = vi.hoisted(() => vi.fn());
vi.mock('workbox-precaching', () => ({precacheAndRoute: mockPrecacheAndRoute,}));

const mockGetAllProjects = vi.hoisted(() => vi.fn());
const mockDeleteProject = vi.hoisted(() => vi.fn());
vi.mock('@/helper/indexeddb', () => ({
  getAllProjects: mockGetAllProjects,
  deleteProject: mockDeleteProject,
}));

import '../../src/sw';

// precacheAndRoute is invoked once at module load time, before this file's
// describe/it blocks run — capture the call args into a plain variable here,
// since vitest's global mockReset/clearMocks config (vitest.config.ts) wipes
// the mock's own call history before the first test body executes.
const precacheManifestArg = mockPrecacheAndRoute.mock.calls[0]?.[0];

describe('Service Worker Tests', () => {
  afterEach(() => {
    // Only clear mocks created in individual tests
    vi.clearAllMocks();
  });

  it('precaches the Workbox-generated build manifest on load', () => {
    expect(precacheManifestArg).toBe(globalThis.self.__WB_MANIFEST);
  });

  it('should listen for activate event', () => {
    expect(globalThis.eventListeners.activate).toBeDefined();
    expect(globalThis.eventListeners.activate.length).toBeGreaterThan(0);
  });

  it('deletes stale runtime caches during activate but preserves the Workbox precache', async () => {
    const cachesKeysStub = globalThis.caches.keys;
    cachesKeysStub.mockResolvedValue([
      'remsfal-runtime-v0',
      'remsfal-runtime-v1',
      'workbox-precache-v2-https://example.com/',
    ]);

    const deleteStub = globalThis.caches.delete;
    deleteStub.mockResolvedValue(true);

    const activateEvent = {waitUntil: vi.fn(),};

    const activateListener = globalThis.eventListeners.activate[0];
    activateListener(activateEvent);

    // eslint-disable-next-line no-undef
    await new Promise((resolve) => setImmediate(resolve));

    // Assertions
    expect(cachesKeysStub).toHaveBeenCalledOnce();
    expect(deleteStub).toHaveBeenCalledOnce();
    expect(deleteStub).toHaveBeenCalledWith('remsfal-runtime-v0');
    expect(activateEvent.waitUntil).toHaveBeenCalledTimes(2);
    expect(globalThis.self.clients.claim).toHaveBeenCalledOnce();
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

  it('serves a matching cache entry when the network request fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
    const cachedResponse = new Response('cached body');
    globalThis.caches.match.mockResolvedValue(cachedResponse);

    const event = {
      request: { mode: 'no-cors' },
      respondWith: vi.fn(),
    };

    const fetchListener = globalThis.eventListeners.fetch[0];
    fetchListener(event);

    // eslint-disable-next-line no-undef
    await new Promise((resolve) => setImmediate(resolve));

    expect(event.respondWith).toHaveBeenCalledOnce();
    const result = await event.respondWith.mock.calls[0][0];
    expect(result).toBe(cachedResponse);
  });

  it('falls back to the cached index.html for a failed navigation when nothing else matches', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
    const indexResponse = new Response('<html>offline shell</html>');
    globalThis.caches.match.mockImplementation((request) =>
      Promise.resolve(request === '/index.html' ? indexResponse : null),
    );

    const event = {
      request: { mode: 'navigate' },
      respondWith: vi.fn(),
    };

    const fetchListener = globalThis.eventListeners.fetch[0];
    fetchListener(event);

    // eslint-disable-next-line no-undef
    await new Promise((resolve) => setImmediate(resolve));

    const result = await event.respondWith.mock.calls[0][0];
    expect(result).toBe(indexResponse);
  });

  it('returns an error response for a failed navigation when index.html is not cached either', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
    globalThis.caches.match.mockResolvedValue(null);

    const event = {
      request: { mode: 'navigate' },
      respondWith: vi.fn(),
    };

    const fetchListener = globalThis.eventListeners.fetch[0];
    fetchListener(event);

    // eslint-disable-next-line no-undef
    await new Promise((resolve) => setImmediate(resolve));

    const result = await event.respondWith.mock.calls[0][0];
    expect(result.type).toBe('error');
  });

  it('returns an error response when offline with no cache match at all', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
    globalThis.caches.match.mockResolvedValue(null);

    const event = {
      request: { mode: 'cors' },
      respondWith: vi.fn(),
    };

    const fetchListener = globalThis.eventListeners.fetch[0];
    fetchListener(event);

    // eslint-disable-next-line no-undef
    await new Promise((resolve) => setImmediate(resolve));

    const result = await event.respondWith.mock.calls[0][0];
    expect(result.type).toBe('error');
  });

  it('should handle sync events with tag "sync-projects"', async () => {
    mockGetAllProjects.mockResolvedValue([{ title: 'Offline Project', createdAt: 123456 }]);
    mockDeleteProject.mockResolvedValue(undefined);

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
    expect(mockGetAllProjects).toHaveBeenCalledOnce();
    expect(mockDeleteProject).toHaveBeenCalledWith(123456);
    expect(fetchStub).toHaveBeenCalledOnce();
    expect(fetchStub).toHaveBeenCalledWith(expect.stringContaining('/api/v1/projects'), expect.any(Object));
  });

  it('warns and skips syncProjects for an unknown sync tag', () => {
    const warnStub = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const syncEvent = { tag: 'some-other-tag', waitUntil: vi.fn() };
    const syncListener = globalThis.eventListeners.sync[0];
    syncListener(syncEvent);

    expect(warnStub).toHaveBeenCalledWith('[Service Worker] Unknown sync tag:', 'some-other-tag');
    expect(syncEvent.waitUntil).not.toHaveBeenCalled();
    expect(mockGetAllProjects).not.toHaveBeenCalled();
  });

  it('logs an error and skips deletion when the server responds with a non-ok status', async () => {
    mockGetAllProjects.mockResolvedValue([{ title: 'Rejected Project', createdAt: 111 }]);
    const fetchStub = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 500 });
    const errorStub = vi.spyOn(console, 'error').mockImplementation(() => {});

    const syncEvent = { tag: 'sync-projects', waitUntil: vi.fn() };
    const syncListener = globalThis.eventListeners.sync[0];
    syncListener(syncEvent);

    // eslint-disable-next-line no-undef
    await new Promise((resolve) => setImmediate(resolve));

    expect(fetchStub).toHaveBeenCalledOnce();
    expect(mockDeleteProject).not.toHaveBeenCalled();
    expect(errorStub).toHaveBeenCalledWith(expect.stringContaining('Server responded with error: 500'));
  });

  it('logs an error and continues when the network request for a project throws', async () => {
    mockGetAllProjects.mockResolvedValue([{ title: 'Flaky Project', createdAt: 222 }]);
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));
    const errorStub = vi.spyOn(console, 'error').mockImplementation(() => {});

    const syncEvent = { tag: 'sync-projects', waitUntil: vi.fn() };
    const syncListener = globalThis.eventListeners.sync[0];
    syncListener(syncEvent);

    // eslint-disable-next-line no-undef
    await new Promise((resolve) => setImmediate(resolve));

    expect(mockDeleteProject).not.toHaveBeenCalled();
    expect(errorStub).toHaveBeenCalledWith(
      expect.stringContaining('Error syncing project: Flaky Project'),
      expect.any(Error),
    );
  });

  it('logs an error when reading the offline queue fails', async () => {
    mockGetAllProjects.mockRejectedValue(new Error('IndexedDB unavailable'));
    const errorStub = vi.spyOn(console, 'error').mockImplementation(() => {});

    const syncEvent = { tag: 'sync-projects', waitUntil: vi.fn() };
    const syncListener = globalThis.eventListeners.sync[0];
    syncListener(syncEvent);

    // eslint-disable-next-line no-undef
    await new Promise((resolve) => setImmediate(resolve));

    expect(errorStub).toHaveBeenCalledWith('[Service Worker] syncProjects failed:', expect.any(Error));
  });
});
