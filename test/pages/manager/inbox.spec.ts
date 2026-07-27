import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ManagerInboxPage from '@/pages/manager/inbox.vue';

vi.mock('@/features/manager/inbox', () => ({
  InboxView: {
    name: 'InboxView',
    template: '<div data-test="inbox-view-stub" />',
  },
}));

describe('manager/inbox.vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(ManagerInboxPage);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders InboxView', () => {
    const wrapper = mount(ManagerInboxPage);
    expect(wrapper.find('[data-test="inbox-view-stub"]').exists()).toBe(true);
  });
});
