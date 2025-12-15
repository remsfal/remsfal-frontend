import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import ContractDetailView from '../../src/views/ContractDetailView.vue';
import { tenantContractService, type TenantContractDetail } from '../../src/services/TenantContractService';

vi.mock('vue-router', () => ({ useRoute: () => ({ params: { contractId: 'CNT-TEST' } }) }));

describe('ContractDetailView', () => {
  const detail: TenantContractDetail = {
    id: 'CNT-TEST',
    address: 'Hauptstr. 99',
    monthlyRent: 1200,
    deposit: 3000,
    leaseStart: '2023-01-01',
    leaseEnd: '2024-01-01',
    landlord: 'Test GmbH',
    status: 'Active',
    documents: [{ label: 'Mietvertrag', url: '#' }],
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders contract details from API', async () => {
    vi.spyOn(tenantContractService, 'getContract').mockResolvedValue(detail);

    const wrapper = mount(ContractDetailView);
    await flushPromises();

    expect(wrapper.text()).toContain('Hauptstr. 99');
    expect(wrapper.text()).toContain('1.200,00');
    expect(wrapper.text()).toContain('3.000,00');
    expect(wrapper.text()).toContain('Test GmbH');
    expect(wrapper.text()).toContain('Mietvertrag');
  });

  it('shows fallback notice when fetch fails', async () => {
    vi.spyOn(tenantContractService, 'getContract').mockRejectedValue(new Error('fail'));

    const wrapper = mount(ContractDetailView);
    await flushPromises();

    expect(wrapper.text()).toContain('Vertragsdetails konnten nicht geladen werden');
    expect(wrapper.text()).toContain('Hauptstr. 12'); // fallback address
  });
});
