import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ContractorSettingsPage from '@/pages/contractor/settings.vue';

vi.mock('@/features/common/organizations', () => ({
  UserOrganizationEmploymentsCard: {
    name: 'UserOrganizationEmploymentsCard',
    template: '<div data-test="user-organization-employments-card-stub" />',
  },
}));

describe('contractor/settings.vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(ContractorSettingsPage);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders UserOrganizationEmploymentsCard', () => {
    const wrapper = mount(ContractorSettingsPage);
    expect(wrapper.find('[data-test="user-organization-employments-card-stub"]').exists()).toBe(
      true,
    );
  });
});
