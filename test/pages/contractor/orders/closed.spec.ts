import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import ContractorOrdersClosedPage from '@/pages/contractor/orders/closed.vue';

vi.mock('@/views/contractor/ContractorClientsView.vue', () => ({
  default: {
    name: 'ContractorClientsView',
    template: '<div data-test="clients-view-stub" />',
  },
}));

describe('contractor/orders/closed.vue', () => {
  it('renders ContractorClientsView', () => {
    const wrapper = mount(ContractorOrdersClosedPage);
    expect(wrapper.find('[data-test="clients-view-stub"]').exists()).toBe(true);
  });
});
