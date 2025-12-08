// This file MUST run before vitest.setup.ts
// It fixes jsdom's broken localStorage implementation

// Suppress Node.js warning about --localstorage-file
const originalEmitWarning = process.emitWarning;
process.emitWarning = function (warning, ...args) {
  if (typeof warning === 'string' && warning.includes('--localstorage-file')) {
    return;
  }
  // @ts-expect-error - TypeScript doesn't recognize the spread of args
  return originalEmitWarning.call(process, warning, ...args);
};

class LocalStorageMock implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

// Replace broken jsdom localStorage with working implementation
const storage = new LocalStorageMock();
Object.defineProperty(globalThis, 'localStorage', {
  value: storage,
  writable: true,
  configurable: true,
});
