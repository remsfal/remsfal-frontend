import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import TenantAccountSettingsPage from '@/pages/tenant/account-settings.vue';

vi.mock('@/features/common/users', () => ({
  AccountSettingsView: {
    name: 'AccountSettingsView',
    template: '<div data-test="account-settings-view-stub" />',
  },
}));

describe('tenant/account-settings.vue', () => {
  it('renders AccountSettingsView', () => {
    const wrapper = mount(TenantAccountSettingsPage);
    expect(wrapper.find('[data-test="account-settings-view-stub"]').exists()).toBe(true);
  });
});
