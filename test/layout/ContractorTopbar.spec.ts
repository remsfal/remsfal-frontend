import { mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import ContractorTopbar from '../../src/layout/ContractorTopbar.vue';
import { useUserSessionStore } from '../../src/stores/UserSession';
import { nextTick } from 'vue';
import { vi } from 'vitest';
//import { EventBus } from '@primeuix/src/eventbus';
import { EventBus } from '@primeuix/utils/eventbus';

describe('ContractorTopbar.vue', () => {
//  let wrapper: VueWrapper;
  let userSessionStore;

  beforeEach(() => {
    userSessionStore = useUserSessionStore();
    EventBus().clear();
 //   wrapper = mount(ContractorTopbar);
 //   console.log(wrapper.html());
  });

  it('should toggle the topbar menu when the menu button is clicked', async () => {
    // Change the viewport to 500px.
//    global.innerWidth = 500;
    // Trigger the window resize event.
  //  global.dispatchEvent(new Event('resize'));
    const wrapper = mount(ContractorTopbar);
    expect(wrapper.find('.layout-topbar-menu').classes()).toContain('hidden');
    console.log(wrapper.html());

    await wrapper.findAll('.layout-topbar-menu-button').at(1).trigger('click');
    await nextTick();
    console.log(wrapper.html());
    expect(wrapper.find('.layout-topbar-menu').classes()).not.toContain('hidden');
//    await vi.runAllTicks();
//    await wrapper.findAll('.layout-topbar-menu-button').at(1).trigger('click');
//    await nextTick();
//    console.log(wrapper.html());
 //   expect(wrapper.find('.layout-topbar-menu').classes()).toContain('hidden');
  });

  it('should display the login button when the user is not logged in', async () => {
    const wrapper = mount(ContractorTopbar);
    expect(wrapper.find('.pi-sign-in').exists()).toBe(true);
    expect(wrapper.find('.pi-sign-out').exists()).toBe(false);
  });

  it('should display the logout button when the user is logged in', async () => {
    const wrapper = mount(ContractorTopbar);
    userSessionStore.user = { email: 'test@example.com' };

    expect(wrapper.find('.pi-sign-out').exists()).toBe(true);
    expect(wrapper.find('.pi-sign-in').exists()).toBe(false);
  });
});
