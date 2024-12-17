import sinon from 'sinon';

// setupMocks.js
global.importScripts = sinon.stub().callsFake((...urls) => {
    console.log(`Mock importScripts called for: ${urls.join(', ')}`);
});

global.self = {
    addEventListener: sinon.stub(),
    skipWaiting: sinon.stub(),
    clients: { claim: sinon.stub() },
};

global.caches = {
    open: sinon.stub().resolves({
        addAll: sinon.stub().resolves(true),
        put: sinon.stub().resolves(),
        match: sinon.stub().resolves(null),
    }),
    keys: sinon.stub().resolves([]),
    delete: sinon.stub().resolves(true),
};
