import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ManagerAccountDataPage from '@/pages/manager/account-data.vue';

vi.mock('@/features/common/users', () => ({
  AccountDataView: {
    name: 'AccountDataView',
    template: '<div data-test="account-data-view-stub" />',
  },
}));

describe('manager/account-data.vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(ManagerAccountDataPage);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders AccountDataView', () => {
    const wrapper = mount(ManagerAccountDataPage);
    expect(wrapper.find('[data-test="account-data-view-stub"]').exists()).toBe(true);
  });
});
