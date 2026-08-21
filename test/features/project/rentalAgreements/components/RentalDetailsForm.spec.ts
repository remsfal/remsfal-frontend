import { describe, it, expect, beforeEach } from 'vitest';
import { mount, flushPromises, VueWrapper } from '@vue/test-utils';
import RentalDetailsForm from '@/features/project/rentalAgreements/components/RentalDetailsForm.vue';

describe('RentalDetailsForm', () => {
  let wrapper: VueWrapper;

  const defaultProps = {};

  beforeEach(() => {
    wrapper = mount(RentalDetailsForm, {props: defaultProps,});
  });

  it('renders all input fields', () => {
    expect(wrapper.find('input[name="basicRent"]').exists()).toBe(true);
    expect(wrapper.find('input[name="operatingCostsPrepayment"]').exists()).toBe(true);
    expect(wrapper.find('input[name="heatingCostsPrepayment"]').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'SelectButton' }).exists()).toBe(true);
    expect(wrapper.findAllComponents({ name: 'DatePicker' })).toHaveLength(2);
  });

  it('has required field indicator for billing cycle', () => {
    const labels = wrapper.findAll('label');
    const billingCycleLabel = labels.find((label) => label.text().includes('Zahlungszyklus'));
    expect(billingCycleLabel?.text()).toContain('*');
  });

  it('has billing cycle select button', () => {
    const selectButton = wrapper.findComponent({ name: 'SelectButton' });
    expect(selectButton.exists()).toBe(true);
  });

  it('emits cancel event when cancel button is clicked', async () => {
    const cancelButton = wrapper.findAll('button').find((btn) => btn.text().includes('Abbrechen'));
    expect(cancelButton).toBeDefined();

    await cancelButton?.trigger('click');
    expect(wrapper.emitted('cancel')).toBeTruthy();
  });

  it('disables the submit button while payment start is missing', () => {
    const submitButton = wrapper
      .findAll('button')
      .find((btn) => btn.attributes('type') === 'submit');
    expect(submitButton?.attributes('disabled')).toBeDefined();
  });

  it('shows a required-field indicator and error message for payment start', () => {
    const labels = wrapper.findAll('label');
    const paymentStartLabel = labels.find((label) => label.text().includes('Zahlungsbeginn'));
    expect(paymentStartLabel?.text()).toContain('*');
    expect(wrapper.text()).toContain('Zahlungsbeginn ist erforderlich');
  });

  it('enables the submit button once payment start is provided', () => {
    const wrapperWithStart = mount(RentalDetailsForm, {props: { initialFirstPaymentDate: '2024-01-01' },});

    const submitButton = wrapperWithStart
      .findAll('button')
      .find((btn) => btn.attributes('type') === 'submit');
    expect(submitButton?.attributes('disabled')).toBeUndefined();
  });

  it('has date pickers for first and last payment', () => {
    const datePickers = wrapper.findAllComponents({ name: 'DatePicker' });
    expect(datePickers).toHaveLength(2);
  });

  it('has currency inputs for rent fields', () => {
    const basicRentInput = wrapper.findComponent({ name: 'InputNumber' });
    expect(basicRentInput.exists()).toBe(true);
  });

  it('accepts initial payment dates from props', async () => {
    const wrapperWithDates = mount(RentalDetailsForm, {
      props: {
        ...defaultProps,
        initialFirstPaymentDate: '2024-01-01',
        initialLastPaymentDate: '2024-12-31',
      },
    });

    const datePickers = wrapperWithDates.findAllComponents({ name: 'DatePicker' });
    expect(datePickers).toHaveLength(2);
  });

  it('has submit button with correct label', () => {
    const submitButton = wrapper
      .findAll('button')
      .find((btn) => btn.attributes('type') === 'submit');
    expect(submitButton).toBeDefined();
    expect(submitButton?.text()).toContain('Einheit hinzufügen');
  });

  it('renders optional fields without required marker', () => {
    const labels = wrapper.findAll('label');
    const basicRentLabel = labels.find((label) => label.text().includes('Nettokaltmiete'));
    const operatingCostsLabel = labels.find((label) =>
      label.text().includes('Betriebskostenvorauszahlung'),
    );
    expect(basicRentLabel?.text()).not.toContain('*');
    expect(operatingCostsLabel?.text()).not.toContain('*');
  });

  it('has billing cycle options', () => {
    const selectButton = wrapper.findComponent({ name: 'SelectButton' });
    expect(selectButton.exists()).toBe(true);
  });

  it('prefills amounts and billing cycle from the initial* props', () => {
    const wrapperWithInitialRent = mount(RentalDetailsForm, {
      props: {
        initialBasicRent: 750,
        initialOperatingCostsPrepayment: 120,
        initialHeatingCostsPrepayment: 80,
        initialBillingCycle: 'WEEKLY',
      },
    });

    expect(
      (wrapperWithInitialRent.find('input[name="basicRent"]').element as HTMLInputElement).value,
    ).toContain('750');
    expect(
      (wrapperWithInitialRent.find('input[name="operatingCostsPrepayment"]').element as HTMLInputElement).value,
    ).toContain('120');
    expect(
      (wrapperWithInitialRent.find('input[name="heatingCostsPrepayment"]').element as HTMLInputElement).value,
    ).toContain('80');
    const weeklyButton = wrapperWithInitialRent
      .findAll('button')
      .find((btn) => btn.text() === 'Wöchentlich');
    expect(weeklyButton?.attributes('aria-pressed')).toBe('true');
  });

  it('emits submit with the entered values and resets the form', async () => {
    const [firstDatePicker, lastDatePicker] = wrapper.findAllComponents({ name: 'DatePicker' });
    await firstDatePicker.vm.$emit('update:modelValue', new Date('2024-01-01'));
    await lastDatePicker.vm.$emit('update:modelValue', new Date('2024-12-31'));
    await wrapper.vm.$nextTick();

    const basicRentInput = wrapper.findComponent({ name: 'InputNumber' });
    (basicRentInput.vm as unknown as { writeValue: (v: number) => void }).writeValue(500);
    await wrapper.vm.$nextTick();

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    const emitted = wrapper.emitted('submit');
    expect(emitted).toBeTruthy();
    expect(emitted![0][0]).toEqual(expect.objectContaining({
      basicRent: 500,
      billingCycle: 'MONTHLY',
      firstPaymentDate: '2024-01-01',
      lastPaymentDate: '2024-12-31',
    }));
  });

  it('does not emit submit when the form is submitted without a payment start date', async () => {
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.emitted('submit')).toBeFalsy();
  });

  it('emits submit with optional cost fields populated and basic rent left unset', async () => {
    const [firstDatePicker] = wrapper.findAllComponents({ name: 'DatePicker' });
    await firstDatePicker.vm.$emit('update:modelValue', new Date('2024-03-01'));
    await wrapper.vm.$nextTick();

    const [, operatingCostsInput, heatingCostsInput] = wrapper.findAllComponents({ name: 'InputNumber' });
    (operatingCostsInput.vm as unknown as { writeValue: (v: number) => void }).writeValue(150);
    (heatingCostsInput.vm as unknown as { writeValue: (v: number) => void }).writeValue(80);
    await wrapper.vm.$nextTick();

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    const emitted = wrapper.emitted('submit');
    expect(emitted).toBeTruthy();
    expect(emitted![0][0]).toEqual(expect.objectContaining({
      basicRent: undefined,
      operatingCostsPrepayment: 150,
      heatingCostsPrepayment: 80,
      firstPaymentDate: '2024-03-01',
    }));
  });

  it('shows a validation error and disables submit when the end date is before the start date', () => {
    const wrapperWithInvalidOrder = mount(RentalDetailsForm, {
      props: {
        initialFirstPaymentDate: '2024-12-31',
        initialLastPaymentDate: '2024-01-01',
      },
    });

    expect(wrapperWithInvalidOrder.text()).toContain('Enddatum muss nach dem Startdatum liegen');
    const submitButton = wrapperWithInvalidOrder
      .findAll('button')
      .find((btn) => btn.attributes('type') === 'submit');
    expect(submitButton?.attributes('disabled')).toBeDefined();
  });
});
