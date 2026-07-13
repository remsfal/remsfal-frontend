import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import InboxPage from '@/pages/inbox/index.vue';

vi.mock('@/views/InboxView.vue', () => ({
  default: {
    name: 'InboxView',
    template: '<div data-test="inbox-view-stub" />',
  },
}));

describe('inbox/index.vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(InboxPage);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders InboxView', () => {
    const wrapper = mount(InboxPage);
    expect(wrapper.find('[data-test="inbox-view-stub"]').exists()).toBe(true);
  });
});
