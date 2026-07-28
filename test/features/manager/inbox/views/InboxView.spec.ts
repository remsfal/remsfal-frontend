import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import InboxView from '@/features/manager/inbox/views/InboxView.vue';

vi.mock('@/features/manager/inbox/components/InboxCard.vue', () => ({
  default: {
    name: 'InboxCard',
    template: '<div data-test="inbox-card-stub" />',
  },
}));

describe('InboxView', () => {
  it('renders without errors', () => {
    const wrapper = mount(InboxView);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders InboxCard', () => {
    const wrapper = mount(InboxView);
    expect(wrapper.find('[data-test="inbox-card-stub"]').exists()).toBe(true);
  });
});
