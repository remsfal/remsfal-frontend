import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import TenancieContractList from '@/features/tenant/tenancies/components/TenancieContractList.vue';
import type { TenancyJson } from '@/services/TenancyService';

describe('TenancieContractList', () => {
  const contracts: TenancyJson[] = [
    {
      agreementId: 'aaaaaaaa-0000-0000-0000-000000000001',
      active: true,
      startOfRental: '2024-01-01',
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
      tenants: [],
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

  it('renders a contract card for each contract', () => {
    const wrapper = mount(TenancieContractList, {
      props: {
        contracts,
        loading: false,
        error: null,
      },
    });

    expect(wrapper.text()).toContain('Aktive und abgelaufene Verträge');
    expect(wrapper.findAll('[data-testid="contract-card"]')).toHaveLength(2);
  });

  it('shows loading state and hides empty state while loading', () => {
    const wrapper = mount(TenancieContractList, {
      props: {
        contracts: [],
        loading: true,
        error: null,
      },
    });

    expect(wrapper.text()).toContain('Lade Verträge');
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(false);
  });
});
