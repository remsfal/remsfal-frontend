import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import ContractorOrdersClosedPage from '@/pages/contractor/orders/closed.vue';

vi.mock('@/features/contractor/orderManagement', () => ({
  OrderBillingCard: {
    name: 'OrderBillingCard',
    template: '<div data-test="order-billing-card-stub" />',
  },
}));

describe('contractor/orders/closed.vue', () => {
  it('renders the order billing card', () => {
    const wrapper = mount(ContractorOrdersClosedPage);
    expect(wrapper.find('[data-test="order-billing-card-stub"]').exists()).toBe(true);
  });
});
