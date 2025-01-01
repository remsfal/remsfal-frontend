export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        const isServiceWorkerEnabled = import.meta.env.VITE_SERVICE_WORKER_ENABLED === 'true';

        if (isServiceWorkerEnabled) {
            navigator.serviceWorker
                .register('/service-worker.js')
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });
        } else {
            console.warn('Service Worker is disabled in the current environment.');
        }
    }
}

export function enableBackgroundSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then((registration) => {
            registration.sync.register('sync-projects').catch((error: unknown) => {
                console.error('[App] Background sync failed to register:', error);
            });
        });
    }
}

export function addOnlineEventListener() {
    window.addEventListener('online', () => {
        enableBackgroundSync();
    });
}
