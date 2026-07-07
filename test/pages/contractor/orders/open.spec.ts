import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import ContractorOrdersOpenPage from '@/pages/contractor/orders/open.vue';

vi.mock('@/views/contractor/ContractorClientsView.vue', () => ({
  default: {
    name: 'ContractorClientsView',
    template: '<div data-test="clients-view-stub" />',
  },
}));

describe('contractor/orders/open.vue', () => {
  it('renders ContractorClientsView', () => {
    const wrapper = mount(ContractorOrdersOpenPage);
    expect(wrapper.find('[data-test="clients-view-stub"]').exists()).toBe(true);
  });
});
