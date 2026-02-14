import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import RentalDetailsForm from '@/components/rentalAgreement/RentalDetailsForm.vue';

describe('RentalDetailsForm', () => {
  let wrapper: VueWrapper;

  const defaultProps = {
    unitTitle: 'Apartment 101',
    unitType: 'APARTMENT',
  };

  beforeEach(() => {
    wrapper = mount(RentalDetailsForm, {props: defaultProps,});
  });

  it('renders the form with unit title and type', () => {
    expect(wrapper.find('h4').text()).toBe('Apartment 101');
    expect(wrapper.text()).toContain('Wohnung');
  });

  it('renders all input fields', () => {
    expect(wrapper.find('input[name="basicRent"]').exists()).toBe(true);
    expect(wrapper.find('input[name="operatingCostsPrepayment"]').exists()).toBe(true);
    expect(wrapper.find('input[name="heatingCostsPrepayment"]').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'SelectButton' }).exists()).toBe(true);
    expect(wrapper.findAllComponents({ name: 'DatePicker' }).length).toBe(2);
  });

  it('has required field indicator for billing cycle', () => {
    const labels = wrapper.findAll('label');
    const billingCycleLabel = labels.find((label) => label.text().includes('Abrechnungszeitraum'));
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

  it('enables submit button initially (all fields optional except billing cycle)', () => {
    const submitButton = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Weitere Einheit hinzufügen'));
    // Button should not be disabled initially since all fields are optional
    expect(submitButton?.attributes('disabled')).toBeUndefined();
  });

  it('has date pickers for first and last payment', () => {
    const datePickers = wrapper.findAllComponents({ name: 'DatePicker' });
    expect(datePickers.length).toBe(2);
  });

  it('displays unit type correctly', () => {
    expect(wrapper.text()).toContain('Wohnung');
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
    expect(datePickers.length).toBe(2);
  });

  it('has submit button with correct label', () => {
    const submitButton = wrapper
      .findAll('button')
      .find((btn) => btn.attributes('type') === 'submit');
    expect(submitButton).toBeDefined();
    expect(submitButton?.text()).toContain('Weitere Einheit hinzufügen');
  });

  it('renders optional fields without required marker', () => {
    const labels = wrapper.findAll('label');
    const basicRentLabel = labels.find((label) => label.text().includes('Grundmiete'));
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
});
