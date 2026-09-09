import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '@/App.vue';
import { useEventBus } from '@/stores/EventStore';

const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));


interface MockRoute {
  fullPath: string;
  meta: Record<string, unknown>;
  params: object;
  query: object;
  name: string | undefined;
}

const pushMock = vi.fn();
const mockRoute: MockRoute = {
  fullPath: '/', meta: {}, params: {}, query: {}, name: undefined,
};

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({ push: pushMock, currentRoute: { value: mockRoute } }),
  RouterView: { template: '<div id="router-view" />' }
}));

// Stub all layout components to avoid mounting their full subtrees
vi.mock('@/layouts/manager.vue', () => ({ default: { template: '<div class="layout-manager"><slot /></div>' } }));
vi.mock('@/layouts/project.vue', () => ({ default: { template: '<div class="layout-project"><slot /></div>' } }));
vi.mock('@/layouts/tenant.vue', () => ({ default: { template: '<div class="layout-tenant"><slot /></div>' } }));
vi.mock('@/layouts/contractor.vue', () => ({ default: { template: '<div class="layout-contractor"><slot /></div>' } }));
vi.mock('@/layouts/public.vue', () => ({ default: { template: '<div class="layout-public"><slot /></div>' } }));

describe('App.vue', () => {
  it('renders RouterView inside a layout', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          Toast: true,
          ConfirmDialog: true,
          DynamicDialog: true,
        }
      }
    });

    // App.vue wraps RouterView in a layout component
    expect(wrapper.find('#router-view').exists()).toBe(true);
  });

  it('uses public layout when route has no meta.layout', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          Toast: true,
          ConfirmDialog: true,
          DynamicDialog: true,
        }
      }
    });

    expect(wrapper.find('.layout-public').exists()).toBe(true);
  });

  it('shows a toast with the matching TOAST_LIFE duration for a known severity', () => {
    mount(App, {
      global: {
        stubs: {
          Toast: true,
          ConfirmDialog: true,
          DynamicDialog: true,
        },
      },
    });

    addMock.mockClear();
    const bus = useEventBus();
    bus.emit('toast:show', {
      severity: 'success', summary: 'Summary', detail: 'Detail' 
    });

    expect(addMock).toHaveBeenCalledWith({
      severity: 'success', summary: 'Summary', detail: 'Detail', life: 3000,
    });
  });

  it('falls back to the error TOAST_LIFE duration for an unknown severity', () => {
    mount(App, {
      global: {
        stubs: {
          Toast: true,
          ConfirmDialog: true,
          DynamicDialog: true,
        },
      },
    });

    addMock.mockClear();
    const bus = useEventBus();
    bus.emit('toast:show', {
      severity: 'unknown-severity', summary: 'Summary', detail: 'Detail',
    });

    expect(addMock).toHaveBeenCalledWith({
      severity: 'unknown-severity', summary: 'Summary', detail: 'Detail', life: 4000,
    });
  });

  it('does not redirect on auth:session-expired when the current route does not require auth', () => {
    mockRoute.meta = {};
    mount(App, {
      global: {
        stubs: {
          Toast: true,
          ConfirmDialog: true,
          DynamicDialog: true,
        },
      },
    });

    pushMock.mockClear();
    addMock.mockClear();
    const bus = useEventBus();
    bus.emit('auth:session-expired', {});

    expect(pushMock).not.toHaveBeenCalled();
    expect(addMock).not.toHaveBeenCalled();
  });

  it('redirects to LandingPage on auth:session-expired when the current route requires auth', () => {
    mockRoute.meta = { requiresAuth: true };
    mockRoute.fullPath = '/manager/account-settings';
    mount(App, {
      global: {
        stubs: {
          Toast: true,
          ConfirmDialog: true,
          DynamicDialog: true,
        },
      },
    });

    pushMock.mockClear();
    const bus = useEventBus();
    bus.emit('auth:session-expired', {});

    expect(pushMock).toHaveBeenCalledWith({ name: 'LandingPage', query: { redirect: '/manager/account-settings' } });
  });
});
