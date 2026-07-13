import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ContractorAccountSettingsPage from '@/pages/contractor/account-settings.vue';

vi.mock('@/features/common/users', () => ({
  AccountSettingsView: {
    name: 'AccountSettingsView',
    template: '<div data-test="account-settings-view-stub" />',
  },
}));

describe('contractor/account-settings.vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(ContractorAccountSettingsPage);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders AccountSettingsView', () => {
    const wrapper = mount(ContractorAccountSettingsPage);
    expect(wrapper.find('[data-test="account-settings-view-stub"]').exists()).toBe(true);
  });
});
