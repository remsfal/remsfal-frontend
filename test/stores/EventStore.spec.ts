import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEventBus } from '@/stores/EventStore';

describe('EventStore', () => {
  let bus: ReturnType<typeof useEventBus>;

  beforeEach(() => {
    setActivePinia(createPinia());
    bus = useEventBus();
  });

  it('does nothing when emitting an event with no listeners', () => {
    expect(() => bus.emit('auth:login', { userId: '1' })).not.toThrow();
  });

  it('calls a registered handler on emit', () => {
    const handler = vi.fn();
    bus.on('auth:login', handler);
    bus.emit('auth:login', { userId: '42' });
    expect(handler).toHaveBeenCalledWith({ userId: '42' });
  });

  it('calls multiple handlers registered for the same event', () => {
    const handlerA = vi.fn();
    const handlerB = vi.fn();
    bus.on('auth:login', handlerA);
    bus.on('auth:login', handlerB);
    bus.emit('auth:login', { userId: '1' });
    expect(handlerA).toHaveBeenCalledOnce();
    expect(handlerB).toHaveBeenCalledOnce();
  });

  it('stops calling a handler after unsubscribing via the returned function', () => {
    const handler = vi.fn();
    const unsubscribe = bus.on('auth:login', handler);
    unsubscribe();
    bus.emit('auth:login', { userId: '1' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('removes a specific handler via off()', () => {
    const handlerA = vi.fn();
    const handlerB = vi.fn();
    bus.on('auth:login', handlerA);
    bus.on('auth:login', handlerB);
    bus.off('auth:login', handlerA);
    bus.emit('auth:login', { userId: '1' });
    expect(handlerA).not.toHaveBeenCalled();
    expect(handlerB).toHaveBeenCalledOnce();
  });

  it('removes all handlers for a type via off() without a handler argument', () => {
    const handlerA = vi.fn();
    const handlerB = vi.fn();
    bus.on('auth:login', handlerA);
    bus.on('auth:login', handlerB);
    bus.off('auth:login');
    bus.emit('auth:login', { userId: '1' });
    expect(handlerA).not.toHaveBeenCalled();
    expect(handlerB).not.toHaveBeenCalled();
  });

  it('does not throw when calling off() for a type with no listeners', () => {
    expect(() => bus.off('auth:login')).not.toThrow();
  });

  it('calls a once() handler only for the first emit', () => {
    const handler = vi.fn();
    bus.once('auth:login', handler);
    bus.emit('auth:login', { userId: '1' });
    bus.emit('auth:login', { userId: '2' });
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({ userId: '1' });
  });

  it('allows unsubscribing a once() handler before it fires', () => {
    const handler = vi.fn();
    const unsubscribe = bus.once('auth:login', handler);
    unsubscribe();
    bus.emit('auth:login', { userId: '1' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('keeps events isolated per type', () => {
    const loginHandler = vi.fn();
    const toastHandler = vi.fn();
    bus.on('auth:login', loginHandler);
    bus.on('toast:show', toastHandler);
    bus.emit('auth:login', { userId: '1' });
    expect(loginHandler).toHaveBeenCalledOnce();
    expect(toastHandler).not.toHaveBeenCalled();
  });
});
