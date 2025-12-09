import { afterEach, describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import TenantView from '../../src/views/TenantView.vue';
import { tenantContractService, type TenantContractSummary } from '../../src/services/TenantContractService';

describe('TenantView', () => {
  const mockContracts: TenantContractSummary[] = [
    {
      id: 'C-1',
      address: 'Teststr. 1',
      leaseStart: '2023-01-01',
      leaseEnd: '2024-01-01',
      status: 'Active',
    },
    {
      id: 'C-2',
      address: 'Musterweg 5',
      leaseStart: '2022-06-01',
      leaseEnd: '2023-06-01',
      status: 'Expired',
    },
  ];

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders contracts from API', async () => {
    vi.spyOn(tenantContractService, 'listContracts').mockResolvedValue(mockContracts);

    const wrapper = mount(TenantView);
    await flushPromises();

    const cards = wrapper.findAll('[data-testid="contract-card"]');
    expect(cards).toHaveLength(mockContracts.length);
    expect(wrapper.text()).toContain('Teststr. 1');
    expect(wrapper.text()).toContain('Musterweg 5');
    expect(wrapper.text()).toContain('Aktiv');
    expect(wrapper.text()).toContain('Abgelaufen');
  });

  it('shows error notice and fallback when fetch fails', async () => {
    vi.spyOn(tenantContractService, 'listContracts').mockRejectedValue(new Error('fail'));

    const wrapper = mount(TenantView);
    await flushPromises();

    expect(wrapper.text()).toContain('Verträge konnten nicht geladen werden');
  });

  it('shows empty state when no contracts returned', async () => {
    vi.spyOn(tenantContractService, 'listContracts').mockResolvedValue([]);

    const wrapper = mount(TenantView);
    await flushPromises();

    expect(wrapper.text()).toContain('Keine Verträge gefunden.');
  });
});
