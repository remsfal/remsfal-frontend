import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ManagerActivityFeedsPage from '@/pages/manager/activity-feeds.vue';

vi.mock('@/features/manager/activityFeeds', () => ({
  ActivityFeedView: {
    name: 'ActivityFeedView',
    template: '<div data-test="activity-feed-view-stub" />',
  },
}));

describe('manager/activity-feeds.vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(ManagerActivityFeedsPage);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders ActivityFeedView', () => {
    const wrapper = mount(ManagerActivityFeedsPage);
    expect(wrapper.find('[data-test="activity-feed-view-stub"]').exists()).toBe(true);
  });
});
