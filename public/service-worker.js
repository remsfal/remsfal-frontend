// import * as idb from "idb";

importScripts('/idb.js'); // Lädt die UMD-Version von idb

const CACHE_NAME = 'remsfal-v1';
const CACHE_FILES = [
  '/', // Start-URL
  '/index.html', // HTML-Datei
  '/manifest.json', // PWA Manifest
  '/styles.css', // CSS-Datei
  '/script.js', // JavaScript
  '/favicon.ico', // Favicon
  '/android-chrome-192x192.png', // Icons
  '/android-chrome-512x512.png',
];

// Installations-Event: Dateien werden in den Cache geladen
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching files...');
      return cache.addAll(CACHE_FILES);
    }),
  );
});

// Aktivierungs-Event: Alte Caches löschen
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  console.log('SyncManager supported:', 'SyncManager' in self);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        }),
      );
    }),
  );
  return self.clients.claim(); // Claim control over all clients
});

// Fetch-Event: Online-First Strategie mit Fallback auf den Cache
self.addEventListener('fetch', (event) => {
  console.log('[Service Worker] Fetching:', event.request.url);
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Antwort in den Cache speichern
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Bei einem Fehler (z. B. offline) aus dem Cache holen
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          } else if (event.request.mode === 'navigate') {
            return caches.match('/index.html'); // Fallback auf die Startseite
          }
        });
      }),
  );
});

self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sync event triggered:', event.tag);

  if (event.tag === 'sync-projects') {
    console.log('[Service Worker] Handling sync-projects event...');
    event.waitUntil(
      syncProjects()
        .then(() => {
          console.log('[Service Worker] Sync-projects completed successfully');
        })
        .catch((error) => {
          console.error('[Service Worker] Sync-projects failed:', error);
        }),
    );
  } else {
    console.warn('[Service Worker] Unknown sync tag:', event.tag);
  }
});

async function syncProjects() {
  console.log('[Service Worker] Starting syncProjects...');
  try {
    const db = await idb.openDB('offline-projects-db', 1); // Zugriff über idb.openDB
    console.log('[Service Worker] Database opened successfully');

    const projects = await db.getAll('projects');
    console.log(`[Service Worker] Projects loaded from IndexedDB: ${projects.length}`);

    for (const project of projects) {
      console.log(`[Service Worker] Attempting to sync project: ${project.title}`);
      try {
        const response = await fetch('/api/v1/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: project.title }),
        });

        if (response.ok) {
          console.info(`[Service Worker] Project synced successfully: ${project.title}`);
          await db.delete('projects', project.createdAt);
          console.info(`[Service Worker] Project deleted from IndexedDB: ${project.createdAt}`);
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
  console.log('[Service Worker] Finished syncProjects');
}
