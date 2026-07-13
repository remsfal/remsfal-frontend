interface SyncEvent extends ExtendableEvent {
  readonly tag: string;
}

interface ServiceWorkerGlobalScopeEventMap {
  sync: SyncEvent;
}

interface ServiceWorkerGlobalScope {
  readonly __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
}
