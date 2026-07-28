import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ManagerAccountSettingsPage from '@/pages/manager/account-settings.vue';

vi.mock('@/features/common/users', () => ({
  AccountSettingsView: {
    name: 'AccountSettingsView',
    template: '<div data-test="account-settings-view-stub" />',
  },
}));

describe('manager/account-settings.vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(ManagerAccountSettingsPage);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders AccountSettingsView', () => {
    const wrapper = mount(ManagerAccountSettingsPage);
    expect(wrapper.find('[data-test="account-settings-view-stub"]').exists()).toBe(true);
  });
});
