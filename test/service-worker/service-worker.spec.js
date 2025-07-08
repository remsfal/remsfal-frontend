import './setupMocks.js';
import { expect } from 'chai';
import sinon from 'sinon';

import '../../public/service-worker.js';

describe('Service Worker Tests', () => {
  afterEach(() => {
    // Restore all Sinon stubs
    sinon.restore();
  });

  it('should listen for install event', () => {
    void expect(self.addEventListener.calledWith('install')).to.be.true;
  });

  it('should cache files during install event', async () => {
    const cachesOpenStub = global.caches.open;
    const addAllStub = sinon.stub().resolves();

    cachesOpenStub.resolves({ addAll: addAllStub });

    const installEvent = {
      waitUntil: sinon.stub(),
    };

    const installListener = self.addEventListener.getCall(0).args[1];
    installListener(installEvent);

    await new Promise((resolve) => setImmediate(resolve));

    // Assertions
    void expect(cachesOpenStub.calledOnce).to.be.true;
    void expect(cachesOpenStub.calledWith('remsfal-v1')).to.be.true;
    void expect(addAllStub.calledOnce).to.be.true;
    void expect(installEvent.waitUntil.calledOnce).to.be.true;

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
    void expect(addAllStub.calledWith(sinon.match.array.deepEquals(expectedFiles))).to.be.true;
  });

  it('should listen for activate event', () => {
    void expect(self.addEventListener.calledWith('activate')).to.be.true;
  });

  it('should delete old caches during activate event', async () => {
    const cachesKeysStub = global.caches.keys;
    cachesKeysStub.resolves(['old-cache-v1', 'old-cache-v2']);

    const deleteStub = global.caches.delete;
    deleteStub.resolves(true);

    const activateEvent = {
      waitUntil: sinon.stub(),
    };

    const activateListener = self.addEventListener.getCall(1).args[1];
    activateListener(activateEvent);

    await new Promise((resolve) => setImmediate(resolve));

    // Assertions
    void expect(cachesKeysStub.calledOnce).to.be.true;
    void expect(deleteStub.calledTwice).to.be.true;
    void expect(deleteStub.calledWith('old-cache-v1')).to.be.true;
    void expect(deleteStub.calledWith('old-cache-v2')).to.be.true;

    void expect(activateEvent.waitUntil.calledOnce).to.be.true;
  });

  it('should handle fetch events with cache fallback', async () => {
    const fetchStub = sinon.stub(global, 'fetch').resolves(new Response('mocked network response'));

    const cacheMock = {
      put: sinon.stub().resolves(),
      match: sinon.stub().resolves(null),
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

    void expect(fetchStub.calledWith(event.request)).to.be.true;
    void expect(cacheMock.put.called).to.be.true;
    void expect(event.respondWith.called).to.be.true;
  });

  it('should handle sync events with tag "sync-projects"', async () => {
    const getAllProjectsMock = sinon
      .stub()
      .resolves([{ title: 'Offline Project', createdAt: 123456 }]);
    global.getAllProjects = getAllProjectsMock;

    const deleteProjectMock = sinon.stub().resolves();
    global.deleteProject = deleteProjectMock;

    const fetchStub = sinon.stub(global, 'fetch').resolves({ ok: true });

    const syncEvent = {
      tag: 'sync-projects',
      waitUntil: sinon.stub().callsFake((promise) =>
        promise.then(
          () => {},
          () => {},
        ),
      ),
    };

    const syncListener = self.addEventListener.getCall(3).args[1];
    syncListener(syncEvent);

    await new Promise((resolve) => setImmediate(resolve));

    // Assertions
    void expect(syncEvent.waitUntil.called).to.be.true;
    void expect(getAllProjectsMock.calledOnce).to.be.true;
    void expect(deleteProjectMock.calledOnce).to.be.true;
    void expect(fetchStub.calledOnce).to.be.true;
    void expect(fetchStub.calledWithMatch('/api/v1/projects')).to.be.true;
  });
});