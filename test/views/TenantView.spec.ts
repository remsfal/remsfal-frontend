import { describe, expect, it, vi } from 'vitest';
import { shallowMount, VueWrapper } from '@vue/test-utils';
import TenantView from '../../src/views/TenantView.vue';

vi.mock('../../src/components/ContractorTable.vue', () => ({
  default: {
    name: 'ContractorTable',
    template: '<div class="mock-contractor-table"></div>',
  },
}));

describe('TenantView.vue', () => {
  let wrapper: VueWrapper;

  it('renders the view correctly', () => {
    wrapper = shallowMount(TenantView);

    expect(wrapper.exists()).toBe(true);
  });

  it('renders the heading correctly', () => {
    wrapper = shallowMount(TenantView);

    expect(wrapper.find('h5').text()).toBe('Übersicht aller Auftraggeber');
  });

  it('renders ContractorTable component', () => {
    wrapper = shallowMount(TenantView);

    const contractorTable = wrapper.findComponent({ name: 'ContractorTable' });
    expect(contractorTable.exists()).toBe(true);
  });

  it('has the correct grid structure', () => {
    wrapper = shallowMount(TenantView);

    expect(wrapper.find('.grid').exists()).toBe(true);
    expect(wrapper.find('.grid-cols-12').exists()).toBe(true);
    expect(wrapper.find('.col-span-10').exists()).toBe(true);
  });

  it('has the card wrapper', () => {
    wrapper = shallowMount(TenantView);

    expect(wrapper.find('.card').exists()).toBe(true);
  });
});
