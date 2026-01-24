import { vi } from 'vitest';

// Store event listeners for tests
globalThis.eventListeners = {};

// setupMocks.js
globalThis.importScripts = vi.fn().mockImplementation((...urls) => {
  console.log(`Mock importScripts called for: ${urls.join(', ')}`);
});

globalThis.self = {
  addEventListener: vi.fn().mockImplementation((event, handler) => {
    if (!globalThis.eventListeners[event]) {
      globalThis.eventListeners[event] = [];
    }
    globalThis.eventListeners[event].push(handler);
  }),
  skipWaiting: vi.fn(),
  clients: { claim: vi.fn() },
};

globalThis.caches = {
  open: vi.fn().mockResolvedValue({
    addAll: vi.fn().mockResolvedValue(true),
    put: vi.fn().mockResolvedValue(),
    match: vi.fn().mockResolvedValue(null),
  }),
  keys: vi.fn().mockResolvedValue([]),
  delete: vi.fn().mockResolvedValue(true),
};
