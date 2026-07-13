import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import InboxDetailPage from '@/pages/inbox/[id].vue';

vi.mock('@/views/InboxDetail.vue', () => ({
  default: {
    name: 'InboxDetail',
    template: '<div data-test="inbox-detail-stub" />',
  },
}));

describe('inbox/[id].vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(InboxDetailPage);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders InboxDetail', () => {
    const wrapper = mount(InboxDetailPage);
    expect(wrapper.find('[data-test="inbox-detail-stub"]').exists()).toBe(true);
  });
});
