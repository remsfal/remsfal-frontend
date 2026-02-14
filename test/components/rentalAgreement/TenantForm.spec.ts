import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import TenantForm from '@/components/rentalAgreement/TenantForm.vue';

describe('TenantForm', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(TenantForm);
  });

  it('renders the form with all fields', () => {
    expect(wrapper.find('h4').text()).toBe('Neue Mieterinformationen');
    expect(wrapper.find('input[name="firstName"]').exists()).toBe(true);
    expect(wrapper.find('input[name="lastName"]').exists()).toBe(true);
    expect(wrapper.find('input[name="email"]').exists()).toBe(true);
    expect(wrapper.find('input[name="mobilePhoneNumber"]').exists()).toBe(true);
    expect(wrapper.find('input[name="businessPhoneNumber"]').exists()).toBe(true);
    expect(wrapper.find('input[name="privatePhoneNumber"]').exists()).toBe(true);
    expect(wrapper.find('input[name="placeOfBirth"]').exists()).toBe(true);
  });

  // Note: PrimeVue Forms validation in tests requires full form interaction
  // These validation tests are covered by integration/E2E tests
  it('has required field indicators', () => {
    const labels = wrapper.findAll('label');
    const requiredLabels = labels.filter((label) => label.text().includes('*'));
    expect(requiredLabels.length).toBeGreaterThanOrEqual(2); // firstName and lastName
  });

  it('has submit button with correct label', () => {
    const submitButton = wrapper
      .findAll('button')
      .find((btn) => btn.attributes('type') === 'submit');
    expect(submitButton).toBeDefined();
    expect(submitButton?.text()).toContain('Mieter zur Liste hinzufügen');
  });

  it('emits cancel event when cancel button is clicked', async () => {
    const cancelButton = wrapper.findAll('button').find((btn) => btn.text().includes('Abbrechen'));
    expect(cancelButton).toBeDefined();

    await cancelButton?.trigger('click');
    expect(wrapper.emitted('cancel')).toBeTruthy();
  });

  it('disables submit button when required fields are empty', async () => {
    const submitButton = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Mieter zur Liste hinzufügen'));
    expect(submitButton?.attributes('disabled')).toBeDefined();
  });

  it('has date picker for date of birth', () => {
    const datePicker = wrapper.findComponent({ name: 'DatePicker' });
    expect(datePicker.exists()).toBe(true);
  });

  it('has optional fields without required marker', () => {
    const emailLabel = wrapper
      .findAll('label')
      .find((label) => label.text().includes('E-Mail') && !label.text().includes('*'));
    expect(emailLabel).toBeDefined();
  });
});
