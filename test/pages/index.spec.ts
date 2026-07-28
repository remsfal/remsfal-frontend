import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import LandingPage from '@/pages/index.vue';

vi.mock('@/views/LandingPageView.vue', () => ({
  default: {
    name: 'LandingPageView',
    template: '<div data-test="landing-page-view-stub" />',
  },
}));

describe('index.vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(LandingPage);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders LandingPageView', () => {
    const wrapper = mount(LandingPage);
    expect(wrapper.find('[data-test="landing-page-view-stub"]').exists()).toBe(true);
  });
});
