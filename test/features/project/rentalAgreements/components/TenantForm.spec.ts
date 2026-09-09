import { describe, it, expect, beforeEach } from 'vitest';
import { mount, flushPromises, VueWrapper } from '@vue/test-utils';
import TenantForm from '@/features/project/rentalAgreements/components/TenantForm.vue';

describe('TenantForm', () => {
  let wrapper: VueWrapper;

  const mountForm = (props: Record<string, unknown> = {}) =>
    mount(TenantForm, {
      props: { submitLabel: 'Mieter zur Liste hinzufügen', ...props },
      global: { stubs: { PhoneInput: true } },
    });

  const submitButton = (w: VueWrapper) =>
    w.findAll('button').find((btn) => btn.attributes('type') === 'submit');

  beforeEach(() => {
    wrapper = mountForm();
  });

  it('renders the form with all fields', () => {
    expect(wrapper.find('input[name="firstName"]').exists()).toBe(true);
    expect(wrapper.find('input[name="lastName"]').exists()).toBe(true);
    expect(wrapper.find('input[name="email"]').exists()).toBe(true);
    expect(wrapper.find('input[name="placeOfBirth"]').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'DatePicker' }).exists()).toBe(true);
    expect(wrapper.findAllComponents({ name: 'PhoneInput' })).toHaveLength(3);
  });

  it('does not render a heading by default', () => {
    expect(wrapper.find('h4').exists()).toBe(false);
  });

  it('renders the given heading', () => {
    wrapper = mountForm({ heading: 'Neue Mieterinformationen' });
    expect(wrapper.find('h4').text()).toBe('Neue Mieterinformationen');
  });

  it('has required field indicators', () => {
    const labels = wrapper.findAll('label');
    const requiredLabels = labels.filter((label) => label.text().includes('*'));
    expect(requiredLabels.length).toBe(2); // firstName and lastName
  });

  it('has submit button with the given label', () => {
    expect(submitButton(wrapper)?.text()).toContain('Mieter zur Liste hinzufügen');
  });

  it('shows the cancel button by default and emits cancel', async () => {
    const cancelButton = wrapper.findAll('button').find((btn) => btn.text().includes('Abbrechen'));
    expect(cancelButton).toBeDefined();

    await cancelButton?.trigger('click');
    expect(wrapper.emitted('cancel')).toBeTruthy();
  });

  it('hides the cancel button when showCancel is false', () => {
    wrapper = mountForm({ showCancel: false });
    const cancelButton = wrapper.findAll('button').find((btn) => btn.text().includes('Abbrechen'));
    expect(cancelButton).toBeUndefined();
  });

  it('disables submit button when required fields are empty (create mode)', () => {
    expect(submitButton(wrapper)?.attributes('disabled')).toBeDefined();
  });

  it('enables submit once required fields are valid (create mode)', async () => {
    await wrapper.find('input[name="firstName"]').setValue('Erika');
    await wrapper.find('input[name="lastName"]').setValue('Musterfrau');
    await flushPromises();

    expect(submitButton(wrapper)?.attributes('disabled')).toBeUndefined();
  });

  it('prefills fields from initialValues in edit mode', () => {
    wrapper = mountForm({
      mode: 'edit',
      showCancel: false,
      initialValues: {
        firstName: 'Max', lastName: 'Mustermann', email: 'max@example.com' 
      },
    });

    expect((wrapper.find('input[name="firstName"]').element as HTMLInputElement).value).toBe('Max');
    expect((wrapper.find('input[name="email"]').element as HTMLInputElement).value).toBe(
      'max@example.com',
    );
  });

  it('disables submit in edit mode until a field is changed', async () => {
    wrapper = mountForm({
      mode: 'edit',
      showCancel: false,
      initialValues: { firstName: 'Max', lastName: 'Mustermann' },
    });

    expect(submitButton(wrapper)?.attributes('disabled')).toBeDefined();

    await wrapper.find('input[name="firstName"]').setValue('Erika');
    await flushPromises();

    expect(submitButton(wrapper)?.attributes('disabled')).toBeUndefined();
  });

  it('shows phone validation errors and blocks submit', async () => {
    await wrapper.find('input[name="firstName"]').setValue('Erika');
    await wrapper.find('input[name="lastName"]').setValue('Musterfrau');

    const phoneInputs = wrapper.findAllComponents({ name: 'PhoneInput' });
    await phoneInputs[0].vm.$emit('update:modelValue', 'invalid');
    await flushPromises();

    expect(wrapper.text()).toContain('Ungültiges Telefonformat');
    expect(submitButton(wrapper)?.attributes('disabled')).toBeDefined();
  });

  it('emits submit with the assembled tenant on valid submission', async () => {
    await wrapper.find('input[name="firstName"]').setValue('Erika');
    await wrapper.find('input[name="lastName"]').setValue('Musterfrau');

    const phoneInputs = wrapper.findAllComponents({ name: 'PhoneInput' });
    await phoneInputs[0].vm.$emit('update:modelValue', '+491511234567');
    await flushPromises();

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.emitted('submit')).toBeTruthy();
    const payload = wrapper.emitted('submit')![0][0] as Record<string, unknown>;
    expect(payload.firstName).toBe('Erika');
    expect(payload.lastName).toBe('Musterfrau');
    expect(payload.mobilePhoneNumber).toBe('+491511234567');
  });

  it('does not submit when required fields are missing', async () => {
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.emitted('submit')).toBeFalsy();
  });
});
