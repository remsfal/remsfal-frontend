import './setupMocks.js';
import { expect } from 'chai';
import sinon from 'sinon';

// Lade deinen Service Worker
import '../../public/service-worker.js';

describe('Service Worker Tests', () => {
    afterEach(() => {
        // Restore all Sinon stubs
        sinon.restore();
    });

    it('should listen for install event', () => {
        expect(self.addEventListener.calledWith('install')).to.be.true;
    });

    it('should cache files during install event', async () => {
        // Verwende den bereits vorhandenen Mock für caches.open
        const cachesOpenStub = global.caches.open;
        const addAllStub = sinon.stub().resolves(); // Mock für cache.addAll

        // Simuliere das Verhalten von caches.open
        cachesOpenStub.resolves({ addAll: addAllStub });

        const installEvent = {
            waitUntil: sinon.stub(),
        };

        // Rufe den Install-Event-Listener aus deinem Service Worker ab
        const installListener = self.addEventListener.getCall(0).args[1];
        installListener(installEvent);

        // Warten, bis alle Promises abgearbeitet sind
        await new Promise((resolve) => setImmediate(resolve));

        // Assertions
        expect(cachesOpenStub.calledOnce).to.be.true; // Prüfe, ob caches.open aufgerufen wurde
        expect(cachesOpenStub.calledWith('remsfal-v1')).to.be.true; // Prüfe den Cache-Namen
        expect(addAllStub.calledOnce).to.be.true; // Prüfe, ob addAll aufgerufen wurde
        expect(installEvent.waitUntil.calledOnce).to.be.true; // Prüfe waitUntil-Aufruf

        // Prüfe, ob die richtigen Dateien in den Cache geschrieben wurden
        const expectedFiles = [
            '/',
            '/index.html',
            '/manifest.json',
            '/styles.css',
            '/script.js',
            '/favicon.ico',
            '/android-chrome-192x192.png',
            '/android-chrome-512x512.png'
        ];
        expect(addAllStub.calledWith(sinon.match.array.deepEquals(expectedFiles))).to.be.true;
    });

    it('should listen for activate event', () => {
        expect(self.addEventListener.calledWith('activate')).to.be.true;
    });

    it('should delete old caches during activate event', async () => {
        // Verwende den bereits existierenden Mock für caches.keys
        const cachesKeysStub = global.caches.keys;
        cachesKeysStub.resolves(['old-cache-v1', 'old-cache-v2']);

        const deleteStub = global.caches.delete;
        deleteStub.resolves(true);

        const activateEvent = {
            waitUntil: sinon.stub(),
        };

        // Rufe den Activate-Event-Listener ab
        const activateListener = self.addEventListener.getCall(1).args[1];
        activateListener(activateEvent);

        // Warten auf Promises
        await new Promise((resolve) => setImmediate(resolve));

        // Assertions
        expect(cachesKeysStub.calledOnce).to.be.true;             // Prüfe, ob caches.keys aufgerufen wurde
        expect(deleteStub.calledTwice).to.be.true;                // Prüfe, ob alte Caches gelöscht wurden
        expect(deleteStub.calledWith('old-cache-v1')).to.be.true; // Prüfe spezifische Aufrufe
        expect(deleteStub.calledWith('old-cache-v2')).to.be.true;

        // Prüfen, ob waitUntil aufgerufen wurde
        expect(activateEvent.waitUntil.calledOnce).to.be.true;
    });

    it('should handle fetch events with cache fallback', async () => {
        const fetchStub = sinon.stub(global, 'fetch').resolves(new Response('mocked network response'));

        const cacheMock = {
            put: sinon.stub().resolves(),
            match: sinon.stub().resolves(null), // Simuliere, dass der Cache leer ist
        };
        global.caches.open.resolves(cacheMock);

        const absoluteUrl = 'https://example.com/test-resource';
        const event = {
            request: new Request(absoluteUrl),
            respondWith: sinon.stub(),
        };

        const fetchListener = self.addEventListener.getCall(2).args[1];
        fetchListener(event);

        await new Promise((resolve) => setImmediate(resolve));

        expect(fetchStub.calledWith(event.request)).to.be.true;
        expect(cacheMock.put.called).to.be.true;
        expect(event.respondWith.called).to.be.true;
    });

    it('should handle sync events with tag "sync-projects"', async () => {
        const openDBMock = sinon.stub().resolves({
            getAll: sinon.stub().resolves([{ title: 'Offline Project', createdAt: 123456 }]),
            delete: sinon.stub().resolves(),
        });
        global.idb = { openDB: openDBMock };

        const fetchStub = sinon.stub(global, 'fetch').resolves({ ok: true });

        const syncEvent = {
            tag: 'sync-projects',
            waitUntil: sinon.stub(),
        };

        const syncListener = self.addEventListener.getCall(3).args[1];
        syncListener(syncEvent);

        await new Promise((resolve) => setImmediate(resolve));

        expect(syncEvent.waitUntil.called).to.be.true;
        expect(openDBMock.calledOnce).to.be.true;
        expect(fetchStub.calledOnce).to.be.true;
        expect(fetchStub.calledWithMatch('/api/v1/projects')).to.be.true;
    });
});
