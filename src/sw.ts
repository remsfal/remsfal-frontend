import { precacheAndRoute } from 'workbox-precaching';
import { getAllProjects, deleteProject } from '@/helper/indexeddb';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

// Workbox owns its own precache cache (prefixed "workbox-precache-") and cleans it up
// via its own activate listener, so this handler must only ever touch caches under
// our own runtime-cache prefix, never sweep every cache indiscriminately.
const RUNTIME_CACHE_PREFIX = 'remsfal-runtime-';
const RUNTIME_CACHE_NAME = `${RUNTIME_CACHE_PREFIX}v1`;

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

// Fetch event: network-first strategy with fallback to the runtime cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(RUNTIME_CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) {
          return cached;
        }
        if (event.request.mode === 'navigate') {
          const fallback = await caches.match('/index.html');
          if (fallback) {
            return fallback;
          }
        }
        return Response.error();
      }),
  );
});

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
