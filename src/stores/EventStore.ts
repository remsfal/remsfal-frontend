import { defineStore } from 'pinia';

type Events = {
  'toast:show': { severity: string; summary: string; detail: string };
  'toast:translate': { severity: string; summary: string; detail: string };
  'auth:login': { userId: string };
};

type Key = keyof Events;
type Handler<K extends Key> = (payload: Events[K]) => void;

export const useEventBus = defineStore('event-bus', () => {
  // no reactive state necessary – only Listener-Registry
  const listeners = new Map<Key, Set<Function>>();

  function on<K extends Key>(type: K, handler: Handler<K>) {
    let set = listeners.get(type);
    if (!set) listeners.set(type, (set = new Set()));
    set.add(handler as any);
    // Unsubscribe
    return () => set!.delete(handler as any);
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
    else listeners.get(type)?.delete(handler as any);
  }

  function emit<K extends Key>(type: K, payload: Events[K]) {
    listeners.get(type)?.forEach((h) => (h as Handler<K>)(payload));
  }

  return { on, once, off, emit };
});
