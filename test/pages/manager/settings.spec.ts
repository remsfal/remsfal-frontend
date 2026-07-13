import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ManagerSettingsPage from '@/pages/manager/settings.vue';

vi.mock('@/features/common/organizations', () => ({
  UserOrganizationEmploymentsCard: {
    name: 'UserOrganizationEmploymentsCard',
    template: '<div data-test="user-organization-employments-card-stub" />',
  },
}));

describe('manager/settings.vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(ManagerSettingsPage);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders UserOrganizationEmploymentsCard', () => {
    const wrapper = mount(ManagerSettingsPage);
    expect(wrapper.find('[data-test="user-organization-employments-card-stub"]').exists()).toBe(
      true,
    );
  });
});
