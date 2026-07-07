import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import TenancieContractCard from '@/features/tenant/tenancies/components/TenancieContractCard.vue';
import type { TenancyJson } from '@/services/TenancyService';

describe('TenancieContractCard', () => {
  const contract: TenancyJson = {
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
      province: 'Berlin',
      countryCode: 'DE',
    },
    tenants: [
      {
        id: 'tenant-1',
        firstName: 'Max',
        lastName: 'Mustermann',
      },
    ],
    rentalUnits: [
      {
        id: 'unit-1',
        type: 'BUILDING',
        title: 'Haus',
        location: 'haus',
      },
    ],
  };

  it('renders status, financial details and deduplicated unit tag label', () => {
    const wrapper = mount(TenancieContractCard, { props: { contract }, });

    expect(wrapper.find('[data-testid="contract-card"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Aktiv');
    expect(wrapper.text()).toContain('Unbefristet');
    expect(wrapper.text()).toContain('Kosten & Miete');
    expect(wrapper.text()).toContain('Gesamtmiete (warm)');
    expect(wrapper.text()).toContain('Max Mustermann');
    expect(wrapper.text()).toContain('Gebäude Haus');
    expect(wrapper.text()).not.toContain('Gebäude Haus haus');
  });

  it('shows expired status and hides financial block when values are missing', () => {
    const wrapper = mount(TenancieContractCard, {
      props: {
        contract: {
          ...contract,
          active: false,
          basicRent: undefined,
          operatingCostsPrepayment: undefined,
          heatingCostsPrepayment: undefined,
        },
      },
    });

    expect(wrapper.text()).toContain('Abgelaufen');
    expect(wrapper.text()).not.toContain('Kosten & Miete');
  });
});
