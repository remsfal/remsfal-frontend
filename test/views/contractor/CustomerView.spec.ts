import { shallowMount, VueWrapper } from '@vue/test-utils';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import CustomerView from '@/views/contractor/CustomerView.vue';

vi.mock('@/components/ContractorTable.vue', () => ({
  default: {
    name: 'ContractorTable',
    template: '<div class="mock-contractor-table"></div>',
  },
}));

describe('CustomerView.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = shallowMount(CustomerView);
  });

  it('renders the view correctly', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('h5').text()).toBe('Übersicht aller Auftraggeber');

    const contractorTable = wrapper.findComponent({ name: 'ContractorTable' });
    expect(contractorTable.exists()).toBe(true);
  });
});
