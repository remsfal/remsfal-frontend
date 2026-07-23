import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { Form } from '@primevue/forms';
import NewTenantButton from '@/features/project/rentalAgreements/components/NewTenantButton.vue';

const BaseDialogStub = {
  name: 'BaseDialog',
  inheritAttrs: false,
  template: '<div data-testid="dialog" :data-visible="String($attrs.visible)"><slot /></div>',
};

describe('NewTenantButton', () => {
  const mountButton = () =>
    mount(NewTenantButton, {global: {stubs: {BaseDialog: BaseDialogStub,},},});

  it('renders the button with label', () => {
    const wrapper = mountButton();
    expect(wrapper.text()).toContain('Neuen Mieter hinzufügen');
  });

  it('dialog is initially not visible', () => {
    const wrapper = mountButton();
    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('false');
  });

  it('dialog becomes visible when button is clicked', async () => {
    const wrapper = mountButton();
    await wrapper.find('button').trigger('click');

    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('true');
  });

  it('renders TenantForm fields inside the dialog', () => {
    const wrapper = mountButton();
    expect(wrapper.find('input[name="firstName"]').exists()).toBe(true);
    expect(wrapper.find('input[name="lastName"]').exists()).toBe(true);
  });

  it('closes dialog when TenantForm emits cancel', async () => {
    const wrapper = mountButton();
    await wrapper.find('button').trigger('click');

    const cancelBtn = wrapper.findAll('button').find((btn) => btn.text() === 'Abbrechen');
    await cancelBtn?.trigger('click');

    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('false');
  });

  it('emits newTenant and closes dialog when TenantForm submits', async () => {
    const wrapper = mountButton();
    await wrapper.find('button').trigger('click');

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: {
        firstName: { value: 'Erika' },
        lastName: { value: 'Musterfrau' },
        email: { value: '' },
        mobilePhoneNumber: { value: '' },
        businessPhoneNumber: { value: '' },
        privatePhoneNumber: { value: '' },
        placeOfBirth: { value: '' },
      },
    });

    expect(wrapper.emitted('newTenant')).toBeTruthy();
    const payload = wrapper.emitted('newTenant')![0][0] as { firstName: string; lastName: string };
    expect(payload.firstName).toBe('Erika');
    expect(payload.lastName).toBe('Musterfrau');

    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('false');
  });

  it('disables the button when disabled prop is true', () => {
    const wrapper = mount(NewTenantButton, {
      props: { disabled: true },
      global: { stubs: { BaseDialog: BaseDialogStub } },
    });

    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });
});
