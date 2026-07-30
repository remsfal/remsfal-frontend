import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { Form } from '@primevue/forms';
import NewKeyDialog from '@/features/project/rentalAgreements/components/NewKeyDialog.vue';

// Always render dialog content so form fields are accessible without needing to simulate open
const BaseDialogStub = {
  name: 'BaseDialog',
  inheritAttrs: false,
  template: '<div data-testid="dialog" :data-visible="String($attrs.visible)"><slot /></div>',
};

describe('NewKeyDialog', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(NewKeyDialog, {global: {stubs: { BaseDialog: BaseDialogStub },},});
  });

  it('renders the trigger button', () => {
    expect(wrapper.find('button').text()).toContain('Schlüssel');
  });

  it('dialog is initially not visible', () => {
    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('false');
  });

  it('opens the dialog when the trigger button is clicked', async () => {
    await wrapper.find('button').trigger('click');

    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('true');
  });

  it('disables the trigger button when disabled prop is true', () => {
    const disabledWrapper = mount(NewKeyDialog, {
      props: { disabled: true },
      global: { stubs: { BaseDialog: BaseDialogStub } },
    });

    expect(disabledWrapper.find('button').attributes('disabled')).toBeDefined();
  });

  it('renders all key fields with required indicators', () => {
    const labels = wrapper.findAll('label');
    const requiredLabels = labels.filter((label) => label.text().includes('*'));

    expect(requiredLabels).toHaveLength(3);
    expect(wrapper.find('input[name="amountOfKeys"]').exists()).toBe(true);
    expect(wrapper.find('input[name="keyDescription"]').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'DatePicker' }).exists()).toBe(true);
  });

  it('disables the submit button until an issue date is set', () => {
    const submitButton = wrapper.findAll('button').find((btn) => btn.attributes('type') === 'submit');
    expect(submitButton?.attributes('disabled')).toBeDefined();
  });

  it('shows a required error for the issue date once touched', async () => {
    const datePickerInput = wrapper.find('input#issuedAt');
    await datePickerInput.trigger('blur');

    expect(wrapper.text()).toContain('Dieses Feld ist erforderlich');
  });

  it('blocks submission when amount and description are empty', async () => {
    const datePicker = wrapper.findComponent({ name: 'DatePicker' });
    await datePicker.vm.$emit('update:modelValue', new Date('2024-01-01'));

    const form = wrapper.findComponent(Form);
    await form.trigger('submit');

    await new Promise((resolve) => setTimeout(resolve, 50));
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('newKey')).toBeFalsy();
  });

  it('closes the dialog without emitting newKey when cancelled', async () => {
    await wrapper.find('button').trigger('click');

    const descriptionInput = wrapper.find('input[name="keyDescription"]');
    await descriptionInput.setValue('Haustürschlüssel');

    const cancelButton = wrapper.findAll('button').find((btn) => btn.text().includes('Abbrechen'));
    await cancelButton?.trigger('click');

    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('false');
    expect(wrapper.emitted('newKey')).toBeFalsy();
  });

  it('offers common key description suggestions when typing', async () => {
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('complete', { query: 'haus' });

    const suggestions = autoComplete.props('suggestions') as string[];
    expect(suggestions).toContain('Haustürschlüssel');
    expect(suggestions.every((s) => s.toLowerCase().includes('haus'))).toBe(true);
  });

  it('does not emit newKey when the issue date is missing, even with other fields valid', async () => {
    await wrapper.find('button').trigger('click');

    const descriptionInput = wrapper.find('input[name="keyDescription"]');
    await descriptionInput.setValue('Haustürschlüssel');

    const form = wrapper.findComponent(Form);
    await form.trigger('submit');

    await new Promise((resolve) => setTimeout(resolve, 50));
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('newKey')).toBeFalsy();

    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('true');
  });
});
