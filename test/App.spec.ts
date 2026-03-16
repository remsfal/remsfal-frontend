import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '@/App.vue';
import PrimeVue from 'primevue/config';


vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/', meta: {}, params: {}, query: {}, name: undefined }),
  useRouter: () => ({ push: vi.fn(), currentRoute: { value: { fullPath: '/' } } }),
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
        plugins: [PrimeVue],
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
        plugins: [PrimeVue],
        stubs: {
          Toast: true,
          ConfirmDialog: true,
          DynamicDialog: true,
        }
      }
    });

    expect(wrapper.find('.layout-public').exists()).toBe(true);
  });
});
