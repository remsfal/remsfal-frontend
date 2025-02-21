import { shallowMount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ContractorView from '../../src/views/ContractorView.vue';
import PrimeVue from 'primevue/config';

vi.mock('../../src/components/ContractorTable.vue', () => ({
  default: {
    name: 'ContractorTable',
    template: '<div class="mock-contractor-table"></div>',
  },
}));

describe('ContractorView.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = shallowMount(ContractorView, {
      global: {
        plugins: [PrimeVue],
      },
    });
  });

  it('renders the view correctly', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('h5').text()).toBe('Übersicht der Aufträge');

    const contractorTable = wrapper.findComponent({ name: 'ContractorTable' });
    expect(contractorTable.exists()).toBe(true);
  });
});