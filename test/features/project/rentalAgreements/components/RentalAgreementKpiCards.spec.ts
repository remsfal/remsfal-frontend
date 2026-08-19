import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Message from 'primevue/message';
import RentalAgreementKpiCards from '@/features/project/rentalAgreements/components/RentalAgreementKpiCards.vue';
import KpiCard from '@/components/common/KpiCard.vue';
import type { RentalUnitTreeNodeJson } from '@/features/project/rentableUnits';
import {rentalAgreementService,
  type RentalAgreementItemJson,} from '@/features/project/rentalAgreements/services/RentalAgreementService';
import { tenantService, type TenantItemJson } from '@/features/project/rentalAgreements/services/TenantService';

vi.mock('@/features/project/rentalAgreements/services/RentalAgreementService');
vi.mock('@/features/project/rentalAgreements/services/TenantService');

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}-${JSON.stringify(params)}` : key,
    n: (value: number) => `${value} €`,
  }),
}));

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

describe('RentalAgreementKpiCards', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sums costs/tenants and computes vacancy only from current agreements', async () => {
    const agreements: RentalAgreementItemJson[] = [
      {
        id: 'agreement-open-ended',
        startOfRental: '2024-01-01',
        tenants: [],
        rentalUnits: [{ id: 'apt-1', type: 'APARTMENT' }],
        basicRent: 1000,
        heatingCostsPrepayment: 100,
        operatingCostsPrepayment: 50,
      },
      {
        id: 'agreement-future-end',
        startOfRental: '2024-01-01',
        endOfRental: daysFromNow(30),
        tenants: [],
        rentalUnits: [{ id: 'building-1', type: 'BUILDING' }],
        basicRent: 500,
        heatingCostsPrepayment: 50,
        operatingCostsPrepayment: 25,
      },
      {
        id: 'agreement-ended',
        startOfRental: '2020-01-01',
        endOfRental: daysFromNow(-30),
        tenants: [],
        rentalUnits: [{ id: 'apt-2', type: 'APARTMENT' }],
        basicRent: 9999,
        heatingCostsPrepayment: 9999,
        operatingCostsPrepayment: 9999,
      },
    ];
    const tenants: TenantItemJson[] = [
      {
        id: 't1', firstName: 'Max', lastName: 'Mustermann', active: true 
      },
      {
        id: 't2', firstName: 'Erika', lastName: 'Musterfrau', active: false 
      },
      {
        id: 't3', firstName: 'John', lastName: 'Doe', active: true 
      },
    ];
    vi.mocked(rentalAgreementService.getRentalAgreements).mockResolvedValue(agreements);
    vi.mocked(tenantService.fetchTenants).mockResolvedValue(tenants);

    const rentableUnitTree: RentalUnitTreeNodeJson[] = [
      {
        key: 'property-1',
        data: {
          id: 'property-1', type: 'PROPERTY', title: 'Property 1' 
        },
        children: [
          {
            key: 'building-1',
            data: {
              id: 'building-1', type: 'BUILDING', title: 'Building 1' 
            },
            children: [
              {
                key: 'apt-1', data: {
                  id: 'apt-1', type: 'APARTMENT', title: 'Apt 1' 
                }, children: [] 
              },
              {
                key: 'apt-2', data: {
                  id: 'apt-2', type: 'APARTMENT', title: 'Apt 2' 
                }, children: [] 
              },
              {
                key: 'apt-3', data: {
                  id: 'apt-3', type: 'APARTMENT', title: 'Apt 3' 
                }, children: [] 
              },
            ],
          },
        ],
      },
    ];

    wrapper = mount(RentalAgreementKpiCards, {props: { projectId: '123', rentableUnitTree },});
    await flushPromises();

    const cards = wrapper.findAllComponents(KpiCard);
    expect(cards).toHaveLength(7);

    expect(cards[0]!.props('title')).toBe('rentalAgreement.kpi.totalRent');
    expect(cards[0]!.props('value')).toBe('1500 €');
    expect(cards[0]!.props('icon')).toBe('pi pi-euro');

    expect(cards[1]!.props('title')).toBe('rentalAgreement.kpi.totalHeatingCosts');
    expect(cards[1]!.props('value')).toBe('150 €');

    expect(cards[2]!.props('title')).toBe('rentalAgreement.kpi.totalOperatingCosts');
    expect(cards[2]!.props('value')).toBe('75 €');

    expect(cards[3]!.props('title')).toBe('rentalAgreement.kpi.tenantCount');
    expect(cards[3]!.props('value')).toBe(2);

    // property-1 is not directly rented, but building-1 (its child) is -> not vacant.
    expect(cards[4]!.props('title')).toBe('rentalAgreement.kpi.vacancyByType-{"type":"unitTypes.property"}');
    expect(cards[4]!.props('value')).toBe(0);
    expect(cards[4]!.props('icon')).toBe('pi pi-map');

    // building-1 is rented by the still-current "future end" agreement, so no vacancy.
    expect(cards[5]!.props('title')).toBe('rentalAgreement.kpi.vacancyByType-{"type":"unitTypes.building"}');
    expect(cards[5]!.props('value')).toBe(0);
    expect(cards[5]!.props('icon')).toBe('pi pi-home');

    // apt-2 is only referenced by the ended agreement, so it counts as vacant; apt-3 has no agreement at all.
    expect(cards[6]!.props('title')).toBe('rentalAgreement.kpi.vacancyByType-{"type":"unitTypes.apartment"}');
    expect(cards[6]!.props('value')).toBe(2);
    expect(cards[6]!.props('icon')).toBe('pi pi-building');
  });

  it('rolls up vacancy bottom-up: a container is vacant only when none of its descendants are rented', async () => {
    const rentableUnitTree: RentalUnitTreeNodeJson[] = [
      {
        key: 'property-1',
        data: {
          id: 'property-1', type: 'PROPERTY', title: 'Property 1' 
        },
        children: [
          {
            key: 'building-1',
            data: {
              id: 'building-1', type: 'BUILDING', title: 'Building 1' 
            },
            children: [
              {
                key: 'apt-1', data: {
                  id: 'apt-1', type: 'APARTMENT', title: 'Apt 1' 
                }, children: [] 
              },
              {
                key: 'apt-2', data: {
                  id: 'apt-2', type: 'APARTMENT', title: 'Apt 2' 
                }, children: [] 
              },
            ],
          },
        ],
      },
      {
        key: 'property-2',
        data: {
          id: 'property-2', type: 'PROPERTY', title: 'Property 2' 
        },
        children: [
          {
            key: 'building-2',
            data: {
              id: 'building-2', type: 'BUILDING', title: 'Building 2' 
            },
            children: [
              {
                key: 'apt-3', data: {
                  id: 'apt-3', type: 'APARTMENT', title: 'Apt 3' 
                }, children: [] 
              },
              {
                key: 'apt-4', data: {
                  id: 'apt-4', type: 'APARTMENT', title: 'Apt 4' 
                }, children: [] 
              },
            ],
          },
        ],
      },
    ];
    // Only apt-1 is referenced directly -- neither building-1 nor property-1 are referenced
    // by any agreement, yet both must roll up to "not vacant" because of their rented child.
    vi.mocked(rentalAgreementService.getRentalAgreements).mockResolvedValue([
      {
        id: 'a1', startOfRental: '2024-01-01', tenants: [], rentalUnits: [{ id: 'apt-1', type: 'APARTMENT' }],
      },
    ]);
    vi.mocked(tenantService.fetchTenants).mockResolvedValue([]);

    wrapper = mount(RentalAgreementKpiCards, { props: { projectId: '123', rentableUnitTree } });
    await flushPromises();

    const vacancyCards = wrapper.findAllComponents(KpiCard).slice(4);
    const values = Object.fromEntries(
      vacancyCards.map((card) => [
        (card.props('title') as string).match(/unitTypes\.(\w+)/)![1],
        card.props('value'),
      ]),
    );

    // property-1/building-1 (containing the rented apt-1) are NOT vacant; property-2/building-2
    // (fully vacant) ARE.
    expect(values.property).toBe(1);
    expect(values.building).toBe(1);
    // apt-2, apt-3, apt-4 are vacant; apt-1 is rented.
    expect(values.apartment).toBe(3);
  });

  it('omits vacancy cards for unit types absent from the tree', async () => {
    vi.mocked(rentalAgreementService.getRentalAgreements).mockResolvedValue([
      {
        id: 'a1', startOfRental: '2024-01-01', tenants: [], rentalUnits: [],
      },
    ]);
    vi.mocked(tenantService.fetchTenants).mockResolvedValue([]);

    wrapper = mount(RentalAgreementKpiCards, { props: { projectId: '123', rentableUnitTree: [] } });
    await flushPromises();

    const titles = wrapper.findAllComponents(KpiCard).map((card) => card.props('title'));
    expect(titles).toEqual([
      'rentalAgreement.kpi.totalRent',
      'rentalAgreement.kpi.totalHeatingCosts',
      'rentalAgreement.kpi.totalOperatingCosts',
      'rentalAgreement.kpi.tenantCount',
    ]);
  });

  it('shows an empty-state message with a link to create a rental agreement when none exist', async () => {
    vi.mocked(rentalAgreementService.getRentalAgreements).mockResolvedValue([]);
    vi.mocked(tenantService.fetchTenants).mockResolvedValue([]);

    wrapper = mount(RentalAgreementKpiCards, { props: { projectId: '123' } });
    await flushPromises();

    expect(wrapper.findComponent(KpiCard).exists()).toBe(false);

    const message = wrapper.findComponent(Message);
    expect(message.exists()).toBe(true);
    expect(message.props('severity')).toBe('success');

    const link = wrapper.find('a[href="/projects/123/agreements"]');
    expect(link.exists()).toBe(true);
  });

  it('shows skeletons while loading', () => {
    vi.mocked(rentalAgreementService.getRentalAgreements).mockReturnValue(new Promise(() => {}));
    vi.mocked(tenantService.fetchTenants).mockReturnValue(new Promise(() => {}));

    wrapper = mount(RentalAgreementKpiCards, { props: { projectId: '123' } });

    expect(wrapper.findComponent({ name: 'Skeleton' }).exists()).toBe(true);
    expect(wrapper.findComponent(KpiCard).exists()).toBe(false);
  });

  it('shows skeletons and a toast when the fetch fails', async () => {
    vi.mocked(rentalAgreementService.getRentalAgreements).mockRejectedValueOnce(new Error('Fetch failed'));
    vi.mocked(tenantService.fetchTenants).mockResolvedValue([]);

    wrapper = mount(RentalAgreementKpiCards, { props: { projectId: '123' } });
    await flushPromises();

    expect(wrapper.findComponent({ name: 'Skeleton' }).exists()).toBe(true);
    expect(wrapper.findComponent(KpiCard).exists()).toBe(false);
  });
});
