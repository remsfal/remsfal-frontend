import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import NewOrganizationDialog from '@/features/common/organizations/components/NewOrganizationDialog.vue';
import PhoneInputComponent from '@/components/common/PhoneInput.vue';
import { organizationService } from '@/services/OrganizationService';

const DialogStub = {
  name: 'StubDialog',
  template: '<div class="stub-dialog"><slot /></div>',
  props: ['visible', 'header', 'modal', 'style'],
  emits: ['update:visible'],
};

const PhoneInputStub = {
  name: 'PhoneInput',
  template: '<div class="stub-phone" />',
  props: ['modelValue'],
  emits: ['update:modelValue'],
};

const mountDialog = (visible = true) =>
  mount(NewOrganizationDialog, {
    props: { visible },
    global: {
      stubs: {
        Dialog: DialogStub,
        PhoneInput: PhoneInputStub,
      },
    },
  });

describe('NewOrganizationDialog', () => {
  describe('form fields', () => {
    it('renders name, trade, email field labels', () => {
      const wrapper = mountDialog();
      expect(wrapper.text()).toContain('Name');
      expect(wrapper.text()).toContain('Gewerbe');
      expect(wrapper.text()).toContain('E-Mail');
    });

    it('renders the PhoneInput component', () => {
      const wrapper = mountDialog();
      expect(wrapper.find('.stub-phone').exists()).toBe(true);
    });

    it('renders cancel and submit buttons', () => {
      const wrapper = mountDialog();
      const texts = wrapper.findAll('button').map(b => b.text());
      expect(texts.some(t => t.includes('Abbrechen'))).toBe(true);
      expect(texts.some(t => t.includes('Organisation anlegen'))).toBe(true);
    });

    it('renders the required fields note', () => {
      const wrapper = mountDialog();
      expect(wrapper.text()).toContain('Plichtfelder');
    });
  });

  describe('phone validation', () => {
    it('shows error message for invalid phone number', async () => {
      const wrapper = mountDialog();
      const phoneInput = wrapper.findComponent(PhoneInputComponent);

      await phoneInput.vm.$emit('update:modelValue', 'ungültig');
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Telefonformat');
    });

    it('shows no error when phone is empty', async () => {
      const wrapper = mountDialog();
      const phoneInput = wrapper.findComponent(PhoneInputComponent);

      await phoneInput.vm.$emit('update:modelValue', '');
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).not.toContain('Telefonformat');
    });

    it('shows no error for valid E.164 format', async () => {
      const wrapper = mountDialog();
      const phoneInput = wrapper.findComponent(PhoneInputComponent);

      await phoneInput.vm.$emit('update:modelValue', '+4915123456789');
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).not.toContain('Telefonformat');
    });
  });

  describe('submit guard: invalid phone', () => {
    it('does not call createOrganization when phone error is active', async () => {
      vi.spyOn(organizationService, 'createOrganization');
      const wrapper = mountDialog();
      const phoneInput = wrapper.findComponent(PhoneInputComponent);

      // Set invalid phone
      await phoneInput.vm.$emit('update:modelValue', 'ungueltig');
      await wrapper.vm.$nextTick();

      // Try to submit the form
      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(organizationService.createOrganization).not.toHaveBeenCalled();
    });
  });

  describe('onHide / cancel', () => {
    it('emits update:visible=false when dialog triggers close', async () => {
      const wrapper = mountDialog();
      const dialog = wrapper.findComponent(DialogStub);

      await dialog.vm.$emit('update:visible', false);

      const emitted = wrapper.emitted('update:visible');
      expect(emitted).toBeDefined();
      expect(emitted![0]![0]).toBe(false);
    });

    it('resets phone error after hide is triggered', async () => {
      const wrapper = mountDialog();
      const phoneInput = wrapper.findComponent(PhoneInputComponent);
      const dialog = wrapper.findComponent(DialogStub);

      // Set invalid phone to trigger error
      await phoneInput.vm.$emit('update:modelValue', 'invalid');
      await wrapper.vm.$nextTick();
      expect(wrapper.text()).toContain('Telefonformat');

      // Trigger hide — phone value should reset
      await dialog.vm.$emit('update:visible', false);
      await wrapper.vm.$nextTick();

      // Error disappears because phone is now empty
      expect(wrapper.text()).not.toContain('Telefonformat');
    });
  });
});
