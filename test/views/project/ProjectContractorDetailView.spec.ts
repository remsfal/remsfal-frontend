import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ProjectContractorDetailView from '@/views/project/ProjectContractorDetailView.vue';
import { projectContractorService } from '@/services/ProjectContractorService';

vi.mock('@/features/project/contractors', () => ({
  ContractorBaseDataCard: {
    name: 'ContractorBaseDataCard',
    template: '<div data-test="contractor-base-data-card" />',
    props: ['projectId', 'contractorId'],
  },
}));
vi.mock('@/components/AddressCard.vue', () => ({
  default: {
    template: '<div data-test="address-card" />',
    props: ['loadAddress', 'saveAddress'],
  },
}));

describe('ProjectContractorDetailView', () => {
  beforeEach(() => {
    vi.spyOn(projectContractorService, 'getContractor').mockResolvedValue({
      id: 'c-1',
      companyName: 'Test GmbH',
      address: {
        street: 'Teststr. 1', zip: '10115', city: 'Berlin', countryCode: 'DE' 
      },
    });
    vi.spyOn(projectContractorService, 'updateContractor').mockResolvedValue({ id: 'c-1', companyName: 'Test GmbH' });
  });

  const mountView = () =>
    mount(ProjectContractorDetailView, {props: { projectId: 'proj-1', contractorId: 'c-1' },});

  it('renders without errors', () => {
    const wrapper = mountView();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders ContractorBaseDataCard', () => {
    const wrapper = mountView();
    expect(wrapper.find('[data-test="contractor-base-data-card"]').exists()).toBe(true);
  });

  it('passes projectId and contractorId to ContractorBaseDataCard', () => {
    const wrapper = mountView();
    const card = wrapper.findComponent({ name: 'ContractorBaseDataCard' });
    expect(card.props('projectId')).toBe('proj-1');
    expect(card.props('contractorId')).toBe('c-1');
  });

  it('renders AddressCard', () => {
    const wrapper = mountView();
    expect(wrapper.find('[data-test="address-card"]').exists()).toBe(true);
  });

  it('loadAddress calls getContractor and returns address', async () => {
    const wrapper = mountView();
    const addressCard = wrapper.findComponent({ name: 'AddressCard' });
    const { loadAddress } = addressCard.props();

    const result = await loadAddress();
    expect(projectContractorService.getContractor).toHaveBeenCalledWith('proj-1', 'c-1');
    expect(result).toEqual({
      street: 'Teststr. 1', zip: '10115', city: 'Berlin', countryCode: 'DE' 
    });
  });

  it('saveAddress calls updateContractor with address', async () => {
    const wrapper = mountView();
    const addressCard = wrapper.findComponent({ name: 'AddressCard' });
    const { saveAddress } = addressCard.props();

    const addr = {
      street: 'New St.', zip: '20000', city: 'Hamburg', countryCode: 'DE' 
    };
    await saveAddress(addr);
    expect(projectContractorService.updateContractor).toHaveBeenCalledWith('proj-1', 'c-1', { address: addr });
  });

  it('loadAddress returns undefined when contractor has no address', async () => {
    vi.spyOn(projectContractorService, 'getContractor').mockResolvedValue({ id: 'c-1', companyName: 'Test GmbH' });
    const wrapper = mountView();
    const addressCard = wrapper.findComponent({ name: 'AddressCard' });
    const { loadAddress } = addressCard.props();

    const result = await loadAddress();
    expect(result).toBeUndefined();
  });
});
