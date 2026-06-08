import { describe, expect, it, vi, afterEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import TenancieContractList from '@/features/tenant/tenancies/TenancieContractList.vue';
import { tenancyService, type TenancyJson } from '@/services/TenancyService';

describe('TenancieContractList', () => {
  const contracts: TenancyJson[] = [
    {
      agreementId: 'aaaaaaaa-0000-0000-0000-000000000001',
      active: true,
      startOfRental: '2024-01-01',
      basicRent: 850,
      operatingCostsPrepayment: 150,
      heatingCostsPrepayment: 80,
      address: {
        street: 'Teststr. 1',
        zip: '12345',
        city: 'Berlin',
      },
      rentalUnits: [
        {
          id: 'unit-1',
          type: 'APARTMENT',
          title: 'Wohnung 1',
          location: 'Teststr. 1',
        },
      ],
      tenants: [
        {
          id: 'c1',
          firstName: 'Max',
          lastName: 'Mustermann',
        },
      ],
    },
    {
      agreementId: 'aaaaaaaa-0000-0000-0000-000000000002',
      active: false,
      startOfRental: '2024-01-01',
      address: {
        street: 'Musterweg 5',
        zip: '12345',
        city: 'Berlin',
      },
      rentalUnits: [
        {
          id: 'unit-2',
          type: 'APARTMENT',
          title: 'Wohnung 2',
          location: 'Musterweg 5',
        },
      ],
      tenants: [],
    },
  ];

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a contract card for each contract after loading', async () => {
    vi.spyOn(tenancyService, 'getTenancies').mockResolvedValue(contracts);

    const wrapper = mount(TenancieContractList);
    await flushPromises();

    expect(wrapper.findAll('[data-testid="contract-card"]')).toHaveLength(2);
    expect(wrapper.text()).toContain('Teststr. 1');
    expect(wrapper.text()).toContain('Musterweg 5');
    expect(wrapper.text()).toContain('Aktiv');
    expect(wrapper.text()).toContain('Abgelaufen');
    expect(wrapper.text()).toContain('Max Mustermann');
    expect(wrapper.text()).toContain('850');
  });

  it('shows loading state and hides empty state while request is pending', async () => {
    vi.spyOn(tenancyService, 'getTenancies').mockImplementation(() => new Promise(() => {}));

    const wrapper = mount(TenancieContractList);
    await nextTick();

    expect(wrapper.text()).toContain('Lade Verträge');
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(false);
  });

  it('shows empty state when no contracts are returned', async () => {
    vi.spyOn(tenancyService, 'getTenancies').mockResolvedValue([]);

    const wrapper = mount(TenancieContractList);
    await flushPromises();

    expect(wrapper.findAll('[data-testid="contract-card"]')).toHaveLength(0);
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
  });

  it('shows error notice when loading contracts fails', async () => {
    vi.spyOn(tenancyService, 'getTenancies').mockRejectedValue(new Error('fail'));

    const wrapper = mount(TenancieContractList);
    await flushPromises();

    expect(wrapper.text()).toContain('Verträge konnten nicht geladen werden');
  });
});