import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import TenantAccountDataPage from '@/pages/tenant/account-data.vue';

vi.mock('@/features/common/users', () => ({
  AccountDataView: {
    name: 'AccountDataView',
    template: '<div data-test="account-data-view-stub" />',
  },
}));

describe('tenant/account-data.vue', () => {
  it('renders AccountDataView', () => {
    const wrapper = mount(TenantAccountDataPage);
    expect(wrapper.find('[data-test="account-data-view-stub"]').exists()).toBe(true);
  });
});
