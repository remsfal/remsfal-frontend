import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import TenantDashboardPage from '@/pages/tenant/dashboard.vue';

vi.mock('@/features/tenant/tenancies/components/TenancieContractList.vue', () => ({
  default: {
    name: 'TenancieContractList',
    template: '<div data-test="tenancie-contract-list-stub" />',
  },
}));

describe('tenant/dashboard.vue', () => {
  it('renders TenancieContractList', () => {
    const wrapper = mount(TenantDashboardPage);
    expect(wrapper.find('[data-test="tenancie-contract-list-stub"]').exists()).toBe(true);
  });
});
