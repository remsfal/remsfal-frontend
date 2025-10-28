import { shallowMount, VueWrapper } from '@vue/test-utils';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import ContractorView from '../../src/views/ContractorView.vue';

vi.mock('../../src/components/ContractorTable.vue', () => ({
  default: {
    name: 'ContractorTable',
    template: '<div class="mock-contractor-table"></div>',
  },
}));

describe('ContractorView.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = shallowMount(ContractorView);
  });

  it('renders the view correctly', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('h5').text()).toBe('Übersicht aller Auftraggeber');

    const contractorTable = wrapper.findComponent({ name: 'ContractorTable' });
    expect(contractorTable.exists()).toBe(true);
  });
});
