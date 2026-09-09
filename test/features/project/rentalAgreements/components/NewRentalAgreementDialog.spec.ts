import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises, VueWrapper } from '@vue/test-utils';
import NewRentalAgreementDialog from '@/features/project/rentalAgreements/components/NewRentalAgreementDialog.vue';
import { rentalAgreementService } from '@/features/project/rentalAgreements/services/RentalAgreementService';
import type { SelectedUnit } from '@/features/project/rentalAgreements/components/Step2UnitsForm.vue';

const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

vi.mock('@/features/project/rentalAgreements/services/RentalAgreementService', async () => {
  const actual = await vi.importActual<
    typeof import('@/features/project/rentalAgreements/services/RentalAgreementService')
      >('@/features/project/rentalAgreements/services/RentalAgreementService');
  return { ...actual, rentalAgreementService: { createRentalAgreement: vi.fn() } };
});

const DialogStub = {
  name: 'Dialog',
  props: ['visible', 'header'],
  emits: ['update:visible'],
  template: '<div data-testid="dialog" v-if="visible"><slot /></div>',
};

const Step1Stub = {
  name: 'Step1DatesForm',
  props: ['startOfRental', 'endOfRental'],
  emits: ['update:startOfRental', 'update:endOfRental', 'next'],
  template: '<div data-testid="step1" />',
};

const Step2Stub = {
  name: 'Step2UnitsForm',
  props: ['projectId', 'selectedUnits', 'startOfRental', 'endOfRental'],
  emits: ['update:selectedUnits', 'next', 'back'],
  template: '<div data-testid="step2" />',
};

const Step3Stub = {
  name: 'Step3TenantsForm',
  props: ['projectId', 'tenants'],
  emits: ['update:tenants', 'next', 'back'],
  template: '<div data-testid="step3" />',
};

const Step4Stub = {
  name: 'Step4Summary',
  props: ['startOfRental', 'endOfRental', 'selectedUnits', 'tenants', 'isLoading'],
  emits: ['submit', 'back', 'editStep', 'cancel'],
  template: '<div data-testid="step4" />',
};

const mountDialog = () =>
  mount(NewRentalAgreementDialog, {
    props: { visible: true, projectId: 'project-1' },
    global: {
      stubs: {
        Dialog: DialogStub,
        Step1DatesForm: Step1Stub,
        Step2UnitsForm: Step2Stub,
        Step3TenantsForm: Step3Stub,
        Step4Summary: Step4Stub,
      },
    },
  });

const fillCompleteForm = async (wrapper: VueWrapper) => {
  const unit: SelectedUnit = {
    rentalUnitId: 'unit-1',
    unitType: 'APARTMENT',
    unitTitle: 'Wohnung 1A',
    basicRent: 500,
  };

  await wrapper.findComponent(Step1Stub).vm.$emit('update:startOfRental', '2024-01-01');
  await wrapper.findComponent(Step2Stub).vm.$emit('update:selectedUnits', [unit]);
  await wrapper.findComponent(Step3Stub).vm.$emit('update:tenants', [
    { firstName: 'Erika', lastName: 'Musterfrau' },
  ]);
};

describe('NewRentalAgreementDialog', () => {
  beforeEach(() => {
    addMock.mockClear();
    vi.mocked(rentalAgreementService.createRentalAgreement).mockResolvedValue(undefined);
  });

  it('creates the rental agreement and emits events on success', async () => {
    const wrapper = mountDialog();
    await fillCompleteForm(wrapper);

    await wrapper.findComponent(Step4Stub).vm.$emit('submit');
    await flushPromises();

    expect(rentalAgreementService.createRentalAgreement).toHaveBeenCalledWith(
      'project-1',
      expect.objectContaining({
        startOfRental: '2024-01-01',
        apartmentRents: [expect.objectContaining({ rentalUnitId: 'unit-1', basicRent: 500 })],
        tenants: [expect.objectContaining({ firstName: 'Erika', lastName: 'Musterfrau' })],
      }),
    );
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    expect(wrapper.emitted('rentalAgreementCreated')).toBeTruthy();
    expect(wrapper.emitted('update:visible')?.at(-1)).toEqual([false]);
  });

  it('does not submit when a required step is incomplete', async () => {
    const wrapper = mountDialog();
    await wrapper.findComponent(Step1Stub).vm.$emit('update:startOfRental', '2024-01-01');

    await wrapper.findComponent(Step4Stub).vm.$emit('submit');
    await flushPromises();

    expect(rentalAgreementService.createRentalAgreement).not.toHaveBeenCalled();
  });

  it('logs and shows no toast when creation fails', async () => {
    vi.mocked(rentalAgreementService.createRentalAgreement).mockRejectedValue(new Error('network error'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mountDialog();
    await fillCompleteForm(wrapper);

    await wrapper.findComponent(Step4Stub).vm.$emit('submit');
    await flushPromises();

    expect(addMock).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create rental agreement:', expect.any(Error));
    expect(wrapper.emitted('rentalAgreementCreated')).toBeFalsy();
    expect(wrapper.emitted('update:visible')).toBeFalsy();

    consoleErrorSpy.mockRestore();
  });
});
