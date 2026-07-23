import RentalAgreementSummaryCard from '@/features/project/rentalAgreements/components/RentalAgreementSummaryCard.vue';
import { mount } from '@vue/test-utils';
import Popover from 'primevue/popover';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}-${JSON.stringify(params)}` : key,
    d: (date: Date) => date.toLocaleDateString('de-DE'),
    n: (value: number) => `${value} €`,
  }),
}));

vi.mock('@/components/common/BaseCard.vue', () => ({
  default: {
    template: `
      <div>
        <slot name="title" />
        <slot name="content" />
      </div>
    `,
  },
}));

describe('RentalAgreementSummaryCard', () => {
  const createAgreement = (overrides = {}) => ({
    id: 'agreement-1',
    startOfRental: '2025-01-01',
    endOfRental: '2025-12-31',
    tenants: [],
    propertyRents: [],
    siteRents: [],
    buildingRents: [],
    apartmentRents: [],
    storageRents: [],
    commercialRents: [],
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calculates totals from rents', () => {
    const wrapper = mount(RentalAgreementSummaryCard, {
      props: {
        rentalAgreement: createAgreement({
          apartmentRents: [
            {
              unitId: 'apartment-1',
              basicRent: 1000,
              operatingCostsPrepayment: 200,
              heatingCostsPrepayment: 100,
            },
          ],
        }),
      },
      global: {stubs: {Popover: true,},},
    });

    expect(wrapper.text()).toContain('1000 €');
    expect(wrapper.text()).toContain('200 €');
    expect(wrapper.text()).toContain('100 €');
  });

  it('uses explicit totals from agreement', () => {
    const wrapper = mount(RentalAgreementSummaryCard, {
      props: {
        rentalAgreement: createAgreement({
          basicRent: 9999,
          operatingCostsPrepayment: 888,
          heatingCostsPrepayment: 777,
        }),
      },
      global: {stubs: {Popover: true,},},
    });

    expect(wrapper.text()).toContain('9999 €');
    expect(wrapper.text()).toContain('888 €');
    expect(wrapper.text()).toContain('777 €');
  });

  it('shows common.notSet when no tenant exists', () => {
    const wrapper = mount(RentalAgreementSummaryCard, {
      props: {rentalAgreement: createAgreement(),},
      global: {stubs: {Popover: true,},},
    });

    expect(wrapper.text()).toContain('common.notSet');
  });

  it('shows "more" for exactly two tenants', () => {
    const wrapper = mount(RentalAgreementSummaryCard, {
      props: {
        rentalAgreement: createAgreement({
          tenants: [
            {
              firstName: 'Max',
              lastName: 'Mustermann',
            },
            {
              firstName: 'Erika',
              lastName: 'Mustermann',
            },
          ],
        }),
      },
      global: {stubs: {Popover: true,},},
    });

    expect(wrapper.text()).toContain('Max Mustermann');
    expect(wrapper.text()).toContain('projectTenancies.table.more');
  });

  it('shows additional tenant count for more than two tenants', () => {
    const wrapper = mount(RentalAgreementSummaryCard, {
      props: {
        rentalAgreement: createAgreement({
          tenants: [
            {
              firstName: 'Max',
              lastName: 'Mustermann',
            },
            {
              firstName: 'Erika',
              lastName: 'Mustermann',
            },
            {
              firstName: 'Hans',
              lastName: 'Meier',
            },
          ],
        }),
      },
      global: {stubs: {Popover: true,},},
    });

    expect(wrapper.text()).toContain('projectTenancies.table.andMore');
  });

  it('shows invalid date unchanged', () => {
    const wrapper = mount(RentalAgreementSummaryCard, {
      props: {rentalAgreement: createAgreement({startOfRental: 'invalid-date',}),},
      global: {stubs: {Popover: true,},},
    });

    expect(wrapper.text()).toContain('invalid-date');
  });

  it('emits delete event when confirmed', async () => {
    const wrapper = mount(RentalAgreementSummaryCard, {
      props: {rentalAgreement: createAgreement(),},
      global: {stubs: {Popover,},},
    });

    await (wrapper.vm as any).confirmDelete();

    expect(wrapper.emitted('delete')).toHaveLength(1);
  });
});