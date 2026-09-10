import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ActivityFeedView from '@/features/manager/activityFeeds/views/ActivityFeedView.vue';

vi.mock('@/features/manager/activityFeeds/components/ActivityFeedCard.vue', () => ({
  default: {
    name: 'ActivityFeedCard',
    template: '<div data-test="activity-feed-card-stub" />',
  },
}));

describe('ActivityFeedView', () => {
  it('renders without errors', () => {
    const wrapper = mount(ActivityFeedView);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders ActivityFeedCard', () => {
    const wrapper = mount(ActivityFeedView);
    expect(wrapper.find('[data-test="activity-feed-card-stub"]').exists()).toBe(true);
  });
});
