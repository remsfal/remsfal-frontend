import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import {describe, it, expect, beforeEach} from 'vitest';
import AppLayout from '@/layout/AppLayout.vue';
import AppFooter from '@/layout/AppFooter.vue';
import { useUserSessionStore } from '@/stores/UserSession';

describe('AppLayout.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(async () => {
    wrapper = mount(AppLayout, {props: {fullscreen: false,},});
    // Set user AFTER mount so the testing Pinia (from config.global.plugins) is active
    const sessionStore = useUserSessionStore();
    const user = { email: 'test@example.com', userContexts: ['CONTRACTOR'] };
    sessionStore.user = user as ReturnType<typeof useUserSessionStore>['user'];
    // Pre-load the contractor dashboard so the lazy component is cached for all tests
    await wrapper.vm.$router.push('/contractor/dashboard');
    await flushPromises();
  });

  it('should render the layout components correctly', async () => {
    const footer = wrapper.findComponent(AppFooter);
    expect(footer.exists()).toBe(true);

    await wrapper.vm.$router.push('/contractor/dashboard');
    await flushPromises();
    await wrapper.vm.$nextTick();

    const routerViewContent = wrapper.html();
    expect(routerViewContent).toContain('Auftragnehmer Dashboard');
  });

  it('should display correct content for the contractor route', async () => {
    await wrapper.vm.$router.push('/contractor/dashboard');
    await wrapper.vm.$nextTick();

    const routerViewContent = wrapper.html();
    expect(routerViewContent).toContain('Auftragnehmer Dashboard');
  });
});
