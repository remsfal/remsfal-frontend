/* eslint-env serviceworker */
/* global importScripts, getAllProjects, deleteProject */
importScripts('/idbHelper.js');

const CACHE_NAME = 'remsfal-v1';
const CACHE_FILES = [
  '/', // Start URL
  '/index.html', // HTML file
  '/manifest.json', // PWA manifest
  '/styles.css', // CSS file
  '/script.js', // JavaScript file
  '/favicon.ico', // Favicon
  '/android-chrome-192x192.png', // Icons
  '/android-chrome-512x512.png',
];

// Install event: Load files into the cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_FILES);
    }),
  );
});

// Activate event: Delete old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        }),
      );
    }),
  );
  return self.clients.claim(); // Claim control over all clients
});

// Fetch event: Online-first strategy with fallback to the cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Save the response in the cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // On error (e.g., offline), retrieve from the cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          } else if (event.request.mode === 'navigate') {
            return caches.match('/index.html'); // Fallback to the start page
          }
        });
      }),
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-projects') {
    event.waitUntil(
      syncProjects().catch((error) => {
        console.error('[Service Worker] Sync-projects failed:', error);
      }),
    );
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
