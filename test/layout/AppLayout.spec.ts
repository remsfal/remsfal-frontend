import { mount, VueWrapper } from '@vue/test-utils';
import {describe, it, expect, beforeEach} from 'vitest';
import AppLayout from '../../src/layout/AppLayout.vue';
import AppFooter from '../../src/layout/AppFooter.vue';

describe('AppLayout.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(AppLayout, {props: {fullscreen: false,},});
  });

  it('should render the layout components correctly', async () => {
    const footer = wrapper.findComponent(AppFooter);
    expect(footer.exists()).toBe(true);

    await wrapper.vm.$router.push('/customers');
    await wrapper.vm.$nextTick();

    const routerViewContent = wrapper.html();
    expect(routerViewContent).toContain('Übersicht aller Auftraggeber');
  });

  it('should display correct content for the contractor route', async () => {
    await wrapper.vm.$router.push('/customers');
    await wrapper.vm.$nextTick();

    const routerViewContent = wrapper.html();
    expect(routerViewContent).toContain('Übersicht aller Auftraggeber');
  });
});
