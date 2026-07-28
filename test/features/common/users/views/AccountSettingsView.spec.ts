import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AccountSettingsView from '@/features/common/users/views/AccountSettingsView.vue';

vi.mock('@/features/common/organizations', () => ({
  UserOrganizationEmploymentsCard: {
    name: 'UserOrganizationEmploymentsCard',
    template: '<div data-test="user-organization-employments-card-stub" />',
  },
}));

describe('AccountSettingsView', () => {
  it('renders without errors', () => {
    const wrapper = mount(AccountSettingsView);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders UserOrganizationEmploymentsCard', () => {
    const wrapper = mount(AccountSettingsView);
    expect(wrapper.find('[data-test="user-organization-employments-card-stub"]').exists()).toBe(
      true,
    );
  });
});
