import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import ContractorOrdersClosedPage from '@/pages/contractor/orders/closed.vue';

vi.mock('@/features/contractor/orderManagement', () => ({
  OrderPlacementRequestsCard: {
    name: 'OrderPlacementRequestsCard',
    template: '<div data-test="order-placement-requests-card-stub" />',
  },
  QuotationRequestsCard: {
    name: 'QuotationRequestsCard',
    template: '<div data-test="quotation-requests-card-stub" />',
  },
}));

describe('contractor/orders/closed.vue', () => {
  it('renders both order management cards', () => {
    const wrapper = mount(ContractorOrdersClosedPage);
    expect(wrapper.find('[data-test="order-placement-requests-card-stub"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="quotation-requests-card-stub"]').exists()).toBe(true);
  });
});
