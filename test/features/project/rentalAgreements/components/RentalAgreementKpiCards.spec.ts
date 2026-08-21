import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Message from 'primevue/message';
import RentalAgreementKpiCards from '@/features/project/rentalAgreements/components/RentalAgreementKpiCards.vue';
import KpiCard from '@/components/common/KpiCard.vue';
import {rentalAgreementService,
  type RentalAgreementItemJson,} from '@/features/project/rentalAgreements/services/RentalAgreementService';

vi.mock('@/features/project/rentalAgreements/services/RentalAgreementService');

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

  afterEach(() => {
    wrapper?.unmount();
  });

  it('sums costs/tenants and computes vacancy only from current agreements', async () => {
    const agreements: RentalAgreementItemJson[] = [
      {
        id: 'agreement-open-ended',
        startOfRental: '2024-01-01',
        tenants: [{
          id: 't1', firstName: 'Max', lastName: 'Mustermann' 
        }],
        rentalUnits: [{ id: 'apt-1', type: 'APARTMENT' }],
        basicRent: 1000,
        heatingCostsPrepayment: 100,
        operatingCostsPrepayment: 50,
      },
      {
        id: 'agreement-future-end',
        startOfRental: '2024-01-01',
        endOfRental: daysFromNow(30),
        tenants: [{
          id: 't2', firstName: 'Erika', lastName: 'Musterfrau' 
        }],
        rentalUnits: [{ id: 'building-1', type: 'BUILDING' }],
        basicRent: 500,
        heatingCostsPrepayment: 50,
        operatingCostsPrepayment: 25,
      },
      {
        id: 'agreement-ended',
        startOfRental: '2020-01-01',
        endOfRental: daysFromNow(-30),
        tenants: [{
          id: 't3', firstName: 'John', lastName: 'Doe' 
        }],
        rentalUnits: [{ id: 'apt-2', type: 'APARTMENT' }],
        basicRent: 9999,
        heatingCostsPrepayment: 9999,
        operatingCostsPrepayment: 9999,
      },
    ];
    vi.mocked(rentalAgreementService.getRentalAgreements).mockResolvedValue(agreements);

    wrapper = mount(RentalAgreementKpiCards, {
      props: {
        projectId: '123',
        unitIdsByType: {
          APARTMENT: ['apt-1', 'apt-2', 'apt-3'],
          BUILDING: ['building-1'],
          SITE: [],
        },
      },
    });
    await flushPromises();

    const cards = wrapper.findAllComponents(KpiCard);
    expect(cards).toHaveLength(6);

    expect(cards[0]!.props('title')).toBe('rentalAgreement.kpi.totalRent');
    expect(cards[0]!.props('value')).toBe('1500 €');
    expect(cards[0]!.props('icon')).toBe('pi pi-euro');

    expect(cards[1]!.props('title')).toBe('rentalAgreement.kpi.totalHeatingCosts');
    expect(cards[1]!.props('value')).toBe('150 €');

    expect(cards[2]!.props('title')).toBe('rentalAgreement.kpi.totalOperatingCosts');
    expect(cards[2]!.props('value')).toBe('75 €');

    expect(cards[3]!.props('title')).toBe('rentalAgreement.kpi.tenantCount');
    expect(cards[3]!.props('value')).toBe(2);

    // apt-2 is only referenced by the ended agreement, so it counts as vacant; apt-3 has no agreement at all.
    expect(cards[4]!.props('title')).toBe('rentalAgreement.kpi.vacancyByType-{"type":"unitTypes.apartment"}');
    expect(cards[4]!.props('value')).toBe(2);
    expect(cards[4]!.props('icon')).toBe('pi pi-building');

    // building-1 is rented by the still-current "future end" agreement, so no vacancy.
    expect(cards[5]!.props('title')).toBe('rentalAgreement.kpi.vacancyByType-{"type":"unitTypes.building"}');
    expect(cards[5]!.props('value')).toBe(0);
    expect(cards[5]!.props('icon')).toBe('pi pi-home');
  });

  it('deduplicates tenants that appear in multiple active agreements', async () => {
    vi.mocked(rentalAgreementService.getRentalAgreements).mockResolvedValue([
      {
        id: 'agreement-a',
        startOfRental: '2024-01-01',
        tenants: [{
          id: 'shared-tenant', firstName: 'Max', lastName: 'Mustermann' 
        }],
        rentalUnits: [],
      },
      {
        id: 'agreement-b',
        startOfRental: '2024-01-01',
        endOfRental: daysFromNow(30),
        tenants: [{
          id: 'shared-tenant', firstName: 'Max', lastName: 'Mustermann' 
        }],
        rentalUnits: [],
      },
    ]);

    wrapper = mount(RentalAgreementKpiCards, { props: { projectId: '123' } });
    await flushPromises();

    const cards = wrapper.findAllComponents(KpiCard);
    expect(cards[3]!.props('title')).toBe('rentalAgreement.kpi.tenantCount');
    expect(cards[3]!.props('value')).toBe(1);
  });

  it('omits vacancy cards for unit types without any units', async () => {
    vi.mocked(rentalAgreementService.getRentalAgreements).mockResolvedValue([
      {
        id: 'a1', startOfRental: '2024-01-01', tenants: [], rentalUnits: [],
      },
    ]);

    wrapper = mount(RentalAgreementKpiCards, {props: { projectId: '123', unitIdsByType: { SITE: [], STORAGE: [] } },});
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

    wrapper = mount(RentalAgreementKpiCards, { props: { projectId: '123' } });
    await flushPromises();

    expect(wrapper.findComponent(KpiCard).exists()).toBe(false);

    const message = wrapper.findComponent(Message);
    expect(message.exists()).toBe(true);
    expect(message.props('severity')).toBe('success');

    const link = wrapper.find('a[href="/projects/123/agreements"]');
    expect(link.exists()).toBe(true);
  });

  it('shows loading KpiCard placeholders while loading', () => {
    vi.mocked(rentalAgreementService.getRentalAgreements).mockReturnValue(new Promise(() => {}));

    wrapper = mount(RentalAgreementKpiCards, { props: { projectId: '123' } });

    const cards = wrapper.findAllComponents(KpiCard);
    expect(cards).toHaveLength(6);
    expect(cards.every((card) => card.props('loading'))).toBe(true);
    expect(wrapper.findComponent({ name: 'Skeleton' }).exists()).toBe(true);
  });

  it('hides the loading placeholders after a failed fetch instead of loading forever', async () => {
    vi.mocked(rentalAgreementService.getRentalAgreements).mockRejectedValueOnce(new Error('Fetch failed'));

    wrapper = mount(RentalAgreementKpiCards, {
      props: { projectId: '123' },
      global: { stubs: { RouterLink: true } },
    });
    await flushPromises();

    expect(wrapper.findAllComponents(KpiCard).filter((card) => card.props('loading'))).toHaveLength(0);
    expect(wrapper.findComponent(Message).exists()).toBe(true);
  });
});
