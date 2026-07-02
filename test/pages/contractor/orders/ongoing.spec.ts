import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import ContractorOrdersOngoingPage from '@/pages/contractor/orders/ongoing.vue';

vi.mock('@/views/contractor/CustomerView.vue', () => ({
  default: {
    name: 'CustomerView',
    template: '<div data-test="customer-view-stub" />',
  },
}));

describe('contractor/orders/ongoing.vue', () => {
  it('renders CustomerView', () => {
    const wrapper = mount(ContractorOrdersOngoingPage);
    expect(wrapper.find('[data-test="customer-view-stub"]').exists()).toBe(true);
  });
});
