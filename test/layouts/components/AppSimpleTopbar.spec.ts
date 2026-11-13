import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import AppSimpleTopbar from '@/layouts/components/AppSimpleTopbar.vue';
import { useUserSessionStore, type User } from '@/stores/UserSession';

// Router mock
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({
    params: {}, query: {}, fullPath: '/', name: undefined, meta: {}
  }),
  RouterLink: { template: '<a><slot /></a>' },
}));

describe('AppSimpleTopbar.vue', () => {
  // Used as the topbar of the tenant and the contractor layout
  it.each(['tenant@example.com', 'contractor@example.com'])('renders TopbarUserActions for %s', async (email) => {
    const userStore = useUserSessionStore();
    userStore.user = { email } as User;

    const wrapper = mount(AppSimpleTopbar);

    await flushPromises();

    expect(wrapper.text()).toContain(email);
  });
});
