import { precacheAndRoute } from 'workbox-precaching';
import { getAllProjects, deleteProject } from '@/helper/indexeddb';
import { RUNTIME_CACHE_PREFIX } from '@/helper/clientDataCleanup';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

// Workbox owns its own precache cache (prefixed "workbox-precache-") and cleans it up
// via its own activate listener, so this handler must only ever touch caches under
// our own runtime-cache prefix, never sweep every cache indiscriminately.
// v1 also stored personal API responses — bumping the version makes the activate
// handler below purge it on existing installations.
const RUNTIME_CACHE_NAME = `${RUNTIME_CACHE_PREFIX}v2`;

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith(RUNTIME_CACHE_PREFIX) && cacheName !== RUNTIME_CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return undefined;
        }),
      ),
    ),
  );
  event.waitUntil(self.clients.claim());
});

// Fetch event: network-first strategy with fallback to the runtime cache.
// Requests that must not be cached are not intercepted at all, so the browser
// handles them as if no service worker was installed.
self.addEventListener('fetch', (event) => {
  if (!isCacheableRequest(event.request)) {
    return;
  }
  event.respondWith(networkFirst(event));
});

// API responses contain personal data and must never outlive the session, so only
// same-origin GET requests for the app itself are cached.
function isCacheableRequest(request: Request): boolean {
  if (request.method !== 'GET') {
    return false;
  }
  const url = new URL(request.url);
  return url.origin === self.location.origin && !url.pathname.startsWith('/api/');
}

async function networkFirst(event: FetchEvent): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(event.request);
  } catch {
    return matchCachedResponse(event.request);
  }
  if (response.ok) {
    // Keep the SW alive until the cache write finishes; a failed write must not
    // break the response, so errors are only logged.
    event.waitUntil(updateRuntimeCache(event.request, response.clone()));
  }
  return response;
}

async function updateRuntimeCache(request: Request, response: Response) {
  try {
    const cache = await caches.open(RUNTIME_CACHE_NAME);
    await cache.put(request, response);
  } catch (error) {
    console.error('[Service Worker] Failed to update runtime cache:', error);
  }
}

async function matchCachedResponse(request: Request): Promise<Response> {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  if (request.mode === 'navigate') {
    const fallback = await caches.match('/index.html');
    if (fallback) {
      return fallback;
    }
  }
  return Response.error();
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-projects') {
    // syncProjects() catches and logs its own errors internally and never rejects,
    // so no .catch() is needed here.
    event.waitUntil(syncProjects());
  } else {
    console.warn('[Service Worker] Unknown sync tag:', event.tag);
  }
});

async function syncProjects() {
  try {
    const projects = await getAllProjects();

    for (const project of projects) {
      try {
        const response = await fetch('/api/v1/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: project.title }),
        });

        if (response.ok) {
          await deleteProject(project.createdAt);
        } else {
          console.error(`[Service Worker] Server responded with error: ${response.status}`);
        }
      } catch (error) {
        console.error(`[Service Worker] Error syncing project: ${project.title}`, error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] syncProjects failed:', error);
  }
}
