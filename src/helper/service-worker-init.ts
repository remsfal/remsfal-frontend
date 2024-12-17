export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        const isServiceWorkerEnabled = import.meta.env.VITE_SERVICE_WORKER_ENABLED === 'true';

        if (isServiceWorkerEnabled) {
            navigator.serviceWorker
                .register('/service-worker.js')
                .then((registration) => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });
        } else {
            console.log('Service Worker is disabled in the current environment.');
        }
    }
}

export function enableBackgroundSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then((registration) => {
            registration.sync.register('sync-projects').then(() => {
                console.log('[App] Background sync registered for pending projects');
            }).catch((error: unknown) => {
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
