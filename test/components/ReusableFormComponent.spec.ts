// tests the ReusableFormComponent.vue:
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import ReusableFormComponent from '@/components/ReusableFormComponent.vue';
import PrimeVue from 'primevue/config';

describe('MyFormComponent', () => {
  // Define the default props
  const defaultProps = {
    headline: 'Test Form',
    saveButtonText: 'Save',
    cancelButtonText: 'Cancel',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'isChecked', label: 'Checked', type: 'checkbox' },
      { name: 'dropdownOption', label: 'Option', type: 'dropdown', options: [{ label: 'Option 1', value: 'option1' }] }
    ],
    initialValues: { name: 'name', description: '', isChecked: false, dropdownOption: null },
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  // Define the wrapper
  let wrapper: VueWrapper<ReusableFormComponent>;

  // Create the wrapper before each test
  beforeEach(() => {
    wrapper = mount(ReusableFormComponent, {
      props: defaultProps,
      global: {
        plugins: [PrimeVue]
      },
    });
  });

  // Test that the headline is rendered correctly
  it('renders the headline', () => {
    expect(wrapper.find('h2').text()).toBe(defaultProps.headline);
  });

  // Test that the form fields are rendered correctly
  it('renders the form fields', () => {
    expect(wrapper.find('h2').text()).toBe(defaultProps.headline);
    expect(wrapper.find('label[for="name"]').text()).toBe('Name');
    expect(wrapper.find('label[for="description"]').text()).toBe('Description');
    expect(wrapper.find('label[for="isChecked"]').text()).toBe('Checked');
    expect(wrapper.find('label[for="dropdownOption"]').text()).toBe('Option');
  });

  // if name is left empty, the error message should be displayed
  it('validates required fields', async () => {
    // name input filed has the id 'name'
    const nameInput = wrapper.find('#name');
    await nameInput.setValue('');
    // press tab
    await nameInput.trigger('blur');
    // the error message should be displayed in a span with the class 'error-message'
    expect(wrapper.find('.error-message').text()).toBe('Name is required.');
  });

  // test the update of form values and the emission of the update:values event
  it('updates form values and emits update:values', async () => {
    const nameInput = wrapper.find('#name');
    await nameInput.setValue('Test Name');
    // print the emitted events
    console.log(wrapper.emitted());
    // expect the emitted event to be present
    expect(wrapper.emitted()['update:values']).toBeTruthy();
    expect(wrapper.emitted()['update:values'][0][0]).toEqual({ name: 'Test Name', description: '', isChecked: false, dropdownOption: null });
  });

  // test the action of the save button
  it('calls onSubmit with valid form data', async () => {
    const nameInput = wrapper.find('#name');

    await nameInput.setValue('Test Name');
    const saveButton = wrapper.find('.p-button-primary');
    await saveButton.trigger('click');
    expect(defaultProps.onSubmit).toHaveBeenCalledWith({ name: 'Test Name', description: '', isChecked: false, dropdownOption: null });
  });

  // test the emission of the submit event with valid form data
  it('emits submit event with valid form data', async () => {
    const nameInput = wrapper.find('#name');

    await nameInput.setValue('Test Name');
    const saveButton = wrapper.find('.p-button-primary');
    await saveButton.trigger('click');

    expect(wrapper.emitted().submit).toBeTruthy();
    expect(wrapper.emitted().submit[0][0]).toEqual({ name: 'Test Name', description: '', isChecked: false, dropdownOption: null });
  });

  // test the action of the cancel button
  it('calls onCancel and emits cancel event', async () => {
    const cancelButton = wrapper.find('.p-button-secondary');

    await cancelButton.trigger('click');
    expect(defaultProps.onCancel).toHaveBeenCalled();
    expect(wrapper.emitted().cancel).toBeTruthy();
  });

  // test the action of the cancel button
  it('disables save button when form is invalid or unchanged', async () => {
    const saveButton = wrapper.find('.p-button-primary');
    const nameInput = wrapper.find('#name');
    nameInput.setValue('name');
    expect(saveButton.attributes('disabled')).toBeDefined();
    await nameInput.setValue('Test Name');
    expect(saveButton.attributes('disabled')).toBeUndefined();
  });
});
