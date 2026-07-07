import {describe, it, expect, afterEach, vi} from 'vitest';
import './setupMocks.js';

const mockPrecacheAndRoute = vi.hoisted(() => vi.fn());
vi.mock('workbox-precaching', () => ({precacheAndRoute: mockPrecacheAndRoute,}));

const mockGetAllProjects = vi.hoisted(() => vi.fn());
const mockDeleteProject = vi.hoisted(() => vi.fn());
vi.mock('@/helper/indexeddb', () => ({
  getAllProjects: mockGetAllProjects,
  deleteProject: mockDeleteProject,
}));

import '../../src/sw.ts';

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
});
