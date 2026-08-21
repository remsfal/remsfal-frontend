import RentalAgreementSummaryCard from '@/features/project/rentalAgreements/components/RentalAgreementSummaryCard.vue';
import { rentalAgreementService } from '@/features/project/rentalAgreements/services/RentalAgreementService';
import { mount, flushPromises } from '@vue/test-utils';
import DatePicker from 'primevue/datepicker';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

const toastSpy = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: toastSpy }) }));

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

  const mountCard = (overrides = {}) =>
    mount(RentalAgreementSummaryCard, {
      props: { projectId: 'proj-1', rentalAgreement: createAgreement(overrides) },
      global: {stubs: {Popover: true,},},
      attachTo: document.body,
    });

  const findDialogButton = (text: string) =>
    Array.from(document.querySelectorAll('.p-dialog button')).find(
      (btn) => btn.textContent?.trim() === text,
    ) as HTMLButtonElement | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(rentalAgreementService, 'updateRentalAgreement').mockResolvedValue(undefined);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('calculates totals from rents', () => {
    const wrapper = mount(RentalAgreementSummaryCard, {
      props: {
        projectId: 'proj-1',
        rentalAgreement: createAgreement({
          apartmentRents: [
            {
              rentalUnitId: 'apartment-1',
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
        projectId: 'proj-1',
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
      props: {projectId: 'proj-1', rentalAgreement: createAgreement(),},
      global: {stubs: {Popover: true,},},
    });

    expect(wrapper.text()).toContain('common.notSet');
  });

  it('shows "more" for exactly two tenants', () => {
    const wrapper = mount(RentalAgreementSummaryCard, {
      props: {
        projectId: 'proj-1',
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
        projectId: 'proj-1',
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
      props: {projectId: 'proj-1', rentalAgreement: createAgreement({startOfRental: 'invalid-date',}),},
      global: {stubs: {Popover: true,},},
    });

    expect(wrapper.text()).toContain('invalid-date');
  });

  it('disables the confirm button until a valid end date after the start date is selected', async () => {
    const wrapper = mountCard({ endOfRental: undefined });
    const openBtn = wrapper.findAll('button').find((btn) => btn.text() === 'rentalAgreement.terminate.button');
    await openBtn?.trigger('click');

    expect(findDialogButton('rentalAgreement.terminate.dialogTitle')?.disabled).toBe(true);

    await wrapper.findComponent(DatePicker).vm.$emit('update:modelValue', new Date(2025, 5, 15));
    await wrapper.vm.$nextTick();
    expect(findDialogButton('rentalAgreement.terminate.dialogTitle')?.disabled).toBe(false);

    await wrapper.findComponent(DatePicker).vm.$emit('update:modelValue', new Date(2024, 0, 1));
    await wrapper.vm.$nextTick();
    expect(findDialogButton('rentalAgreement.terminate.dialogTitle')?.disabled).toBe(true);
    expect(document.body.textContent).toContain('rentalAgreement.terminate.invalidDate');
  });

  it('persists the new end date, emits update, shows a success toast and closes the dialog', async () => {
    const wrapper = mountCard();
    const openBtn = wrapper.findAll('button').find((btn) => btn.text() === 'rentalAgreement.terminate.button');
    await openBtn?.trigger('click');

    await wrapper.findComponent(DatePicker).vm.$emit('update:modelValue', new Date(2025, 5, 15));
    await wrapper.vm.$nextTick();
    findDialogButton('rentalAgreement.terminate.dialogTitle')?.click();
    await flushPromises();

    expect(rentalAgreementService.updateRentalAgreement).toHaveBeenCalledWith(
      'proj-1',
      'agreement-1',
      { endOfRental: '2025-06-15' },
    );
    const emitted = wrapper.emitted('update:rentalAgreement');
    expect(emitted).toBeTruthy();
    expect((emitted![0][0] as { endOfRental?: string }).endOfRental).toBe('2025-06-15');
    expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    expect(document.querySelector('.p-dialog')).toBeNull();
  });

  it('shows an error toast and keeps the dialog open when persisting fails', async () => {
    vi.spyOn(rentalAgreementService, 'updateRentalAgreement').mockRejectedValueOnce(new Error('network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mountCard();
    const openBtn = wrapper.findAll('button').find((btn) => btn.text() === 'rentalAgreement.terminate.button');
    await openBtn?.trigger('click');

    await wrapper.findComponent(DatePicker).vm.$emit('update:modelValue', new Date(2025, 5, 15));
    await wrapper.vm.$nextTick();
    findDialogButton('rentalAgreement.terminate.dialogTitle')?.click();
    await flushPromises();

    expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    expect(document.querySelector('.p-dialog')).not.toBeNull();
    expect(wrapper.emitted('update:rentalAgreement')).toBeFalsy();
    consoleSpy.mockRestore();
  });
});
