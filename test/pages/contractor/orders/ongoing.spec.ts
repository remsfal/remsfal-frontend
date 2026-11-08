import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import ContractorOrdersOngoingPage from '@/pages/contractor/orders/ongoing.vue';

vi.mock('@/features/contractor/orderManagement', () => ({
  OngoingOrdersCard: {
    name: 'OngoingOrdersCard',
    template: '<div data-test="ongoing-orders-card-stub" />',
  },
}));

describe('contractor/orders/ongoing.vue', () => {
  it('renders the ongoing orders card', () => {
    const wrapper = mount(ContractorOrdersOngoingPage);
    expect(wrapper.find('[data-test="ongoing-orders-card-stub"]').exists()).toBe(true);
  });
});
