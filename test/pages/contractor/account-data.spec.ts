import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ContractorAccountDataPage from '@/pages/contractor/account-data.vue';

vi.mock('@/features/common/users', () => ({
  AccountDataView: {
    name: 'AccountDataView',
    template: '<div data-test="account-data-view-stub" />',
  },
}));

describe('contractor/account-data.vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(ContractorAccountDataPage);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders AccountDataView', () => {
    const wrapper = mount(ContractorAccountDataPage);
    expect(wrapper.find('[data-test="account-data-view-stub"]').exists()).toBe(true);
  });
});
