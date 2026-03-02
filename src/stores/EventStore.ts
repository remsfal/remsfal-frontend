import { defineStore } from 'pinia';

type Events = {
  'toast:show': { severity: string; summary: string; detail: string };
  'toast:translate': { severity: string; summary: string; detail: string };
  'auth:login': { userId: string };
  'auth:session-expired': Record<string, never>;
};

type Key = keyof Events;
type Handler<K extends Key> = (payload: Events[K]) => void;

export const useEventBus = defineStore('event-bus', () => {
  // Use proper generic typing instead of Function
  const listeners = new Map<Key, Set<Handler<any>>>();

  function on<K extends Key>(type: K, handler: Handler<K>) {
    let set = listeners.get(type) as Set<Handler<K>> | undefined;
    if (!set) listeners.set(type, (set = new Set()));
    set.add(handler);
    // Unsubscribe
    return () => set!.delete(handler);
  }

  function once<K extends Key>(type: K, handler: Handler<K>) {
    const off = on(type, (p: Events[K]) => {
      off();
      handler(p);
    });
    return off;
  }

  function off<K extends Key>(type: K, handler?: Handler<K>) {
    if (!handler) listeners.delete(type);
    else (listeners.get(type) as Set<Handler<K>>)?.delete(handler);
  }

  function emit<K extends Key>(type: K, payload: Events[K]) {
    (listeners.get(type) as Set<Handler<K>>)?.forEach((h) => h(payload));
  }

  return {
 on, once, off, emit 
};
});
