import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import ContractorClientsView from '@/views/contractor/ContractorClientsView.vue';

vi.mock('@/features/contractor/offerManagement', () => ({
  OpenRequestsCard: {
    name: 'OpenRequestsCard',
    template: '<div data-test="open-requests-card-stub" />',
  },
}));

describe('ContractorClientsView.vue', () => {
  it('renders OpenRequestsCard', () => {
    const wrapper = mount(ContractorClientsView);
    expect(wrapper.find('[data-test="open-requests-card-stub"]').exists()).toBe(true);
  });
});
