interface ServiceWorkerRegistration {
  sync: {
    register: (tag: string) => Promise<void>;
  };
}
