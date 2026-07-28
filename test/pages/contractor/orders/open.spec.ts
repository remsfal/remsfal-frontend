import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import ContractorOrdersOpenPage from '@/pages/contractor/orders/open.vue';

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

describe('contractor/orders/open.vue', () => {
  it('renders both order management cards', () => {
    const wrapper = mount(ContractorOrdersOpenPage);
    expect(wrapper.find('[data-test="order-placement-requests-card-stub"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="quotation-requests-card-stub"]').exists()).toBe(true);
  });
});
