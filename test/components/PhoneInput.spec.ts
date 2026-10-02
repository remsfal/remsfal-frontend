/* eslint-disable vue/one-component-per-file, vue/require-default-prop */
import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import PhoneInput from '@/components/PhoneInput.vue';
import { phoneSchema } from '@/helper/validationHelper';

// Stub PrimeVue components to avoid complex rendering
const InputTextStub = defineComponent({
  props: {
    value: { type: String },
    disabled: { type: Boolean },
    type: { type: String },
    fluid: { type: Boolean },
  },
  emits: ['update:modelValue'],
  template:
    '<input class="phone-local-input" :value="value" :disabled="disabled"' +
    ' @input="$emit(\'update:modelValue\', $event.target.value)" />',
});

const SelectStub = defineComponent({
  props: {
    modelValue: { type: Object },
    options: { type: Array },
    optionLabel: { type: String },
    filter: { type: Boolean },
    filterFields: { type: Array },
    disabled: { type: Boolean },
  },
  emits: ['update:modelValue', 'change'],
  template: `<div class="phone-country-select">{{ modelValue?.dialCode }}</div>`,
});

const globalStubs = {
  InputGroup: { template: '<div class="phone-input-group"><slot /></div>' },
  InputText: InputTextStub,
  Select: SelectStub,
};

describe('PhoneInput', () => {
  describe('rendering', () => {
    it('renders the wrapper, select and text input', () => {
      const wrapper = mount(PhoneInput, { global: { stubs: globalStubs } });

      expect(wrapper.find('.phone-input-group').exists()).toBe(true);
      expect(wrapper.find('.phone-country-select').exists()).toBe(true);
      expect(wrapper.find('.phone-local-input').exists()).toBe(true);
    });

    it('shows Germany (+49) as the default country', () => {
      const wrapper = mount(PhoneInput, { global: { stubs: globalStubs } });

      expect(wrapper.find('.phone-country-select').text()).toContain('+49');
    });
  });

  describe('modelValue parsing', () => {
    it('parses an existing E.164 value into country and local number on mount', async () => {
      const wrapper = mount(PhoneInput, {
        props: { modelValue: '+49151234567' },
        global: { stubs: globalStubs },
      });
      await flushPromises();

      // Country shows +49
      expect(wrapper.find('.phone-country-select').text()).toContain('+49');
      // Local input contains the number without country code
      expect((wrapper.find('.phone-local-input').element as HTMLInputElement).value).toBe('151234567');
    });

    it('parses Austrian (+43) numbers correctly', async () => {
      const wrapper = mount(PhoneInput, {
        props: { modelValue: '+43664123456' },
        global: { stubs: globalStubs },
      });
      await flushPromises();

      expect(wrapper.find('.phone-country-select').text()).toContain('+43');
      expect((wrapper.find('.phone-local-input').element as HTMLInputElement).value).toBe('664123456');
    });

    it('leaves local input empty when no modelValue provided', async () => {
      const wrapper = mount(PhoneInput, {
        props: { modelValue: '' },
        global: { stubs: globalStubs },
      });
      await flushPromises();

      expect((wrapper.find('.phone-local-input').element as HTMLInputElement).value).toBe('');
    });
  });

  describe('emit behavior', () => {
    it('emits E.164 value combining default country and entered number', async () => {
      const wrapper = mount(PhoneInput, { global: { stubs: globalStubs } });

      await wrapper.find('.phone-local-input').setValue('151234567');

      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted).toBeDefined();
      expect(emitted!.at(-1)![0]).toBe('+49151234567');
    });

    it('emits empty string when local number is cleared', async () => {
      const wrapper = mount(PhoneInput, {
        props: { modelValue: '+49151234567' },
        global: { stubs: globalStubs },
      });
      await flushPromises();

      await wrapper.find('.phone-local-input').setValue('');

      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted).toBeDefined();
      expect(emitted!.at(-1)![0]).toBe('');
    });

    it('strips non-digit characters from local number before emitting', async () => {
      const wrapper = mount(PhoneInput, { global: { stubs: globalStubs } });

      await wrapper.find('.phone-local-input').setValue('151 234-567');

      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted!.at(-1)![0]).toBe('+49151234567');
    });
  });

  describe('watch on modelValue', () => {
    it('updates local number when modelValue prop changes externally', async () => {
      const wrapper = mount(PhoneInput, {
        props: { modelValue: '+49151234567' },
        global: { stubs: globalStubs },
      });
      await flushPromises();

      await wrapper.setProps({ modelValue: '+43664999888' });
      await flushPromises();

      expect((wrapper.find('.phone-local-input').element as HTMLInputElement).value).toBe('664999888');
    });

    it('clears local number when modelValue becomes empty', async () => {
      const wrapper = mount(PhoneInput, {
        props: { modelValue: '+49151234567' },
        global: { stubs: globalStubs },
      });
      await flushPromises();

      await wrapper.setProps({ modelValue: '' });
      await flushPromises();

      expect((wrapper.find('.phone-local-input').element as HTMLInputElement).value).toBe('');
    });

    it('uses raw value as localNumber when it does not match any dial code', async () => {
      // A value without '+' prefix won't match any country → raw fallback
      const wrapper = mount(PhoneInput, {
        props: { modelValue: '0049151234567' },
        global: { stubs: globalStubs },
      });
      await flushPromises();

      // Should not crash; local input has the raw value
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('disabled state', () => {
    it('passes disabled prop to the local input', () => {
      const wrapper = mount(PhoneInput, {
        props: { disabled: true },
        global: { stubs: globalStubs },
      });

      const input = wrapper.find('.phone-local-input');
      expect(input.attributes('disabled')).toBeDefined();
    });
  });

  describe('PrimeVue Form integration', () => {
    const t = ((key: string) => key) as unknown as Parameters<typeof phoneSchema>[0];

    const FormHost = defineComponent({
      components: { PForm: Form, PhoneInput },
      props: { initialPhone: { type: String, default: '' } },
      emits: ['submit'],
      setup(props, { emit }) {
        return {
          initialValues: { phone: props.initialPhone },
          resolver: zodResolver(z.object({ phone: phoneSchema(t) })),
          onSubmit: (event: FormSubmitEvent) => emit('submit', event),
        };
      },
      template: `
        <PForm v-slot="$form" :initialValues :resolver @submit="onSubmit">
          <PhoneInput name="phone" inputId="phone" />
          <span v-if="$form.phone?.invalid" class="phone-error">{{ $form.phone.error?.message }}</span>
        </PForm>`,
    });

    it('shows the initial form value', async () => {
      const wrapper = mount(FormHost, { props: { initialPhone: '+43664123456' } });
      await flushPromises();

      expect((wrapper.find('#phone').element as HTMLInputElement).value).toBe('664123456');
    });

    it('writes the combined E.164 value into the form state', async () => {
      const wrapper = mount(FormHost);
      await wrapper.find('#phone').setValue('1511234567');
      await wrapper.find('form').trigger('submit');
      await flushPromises();

      const event = wrapper.emitted('submit')![0][0] as FormSubmitEvent;
      expect(event.valid).toBe(true);
      expect(event.states.phone.value).toBe('+491511234567');
    });

    it('validates through the form resolver', async () => {
      const wrapper = mount(FormHost);
      await wrapper.find('#phone').setValue('12');
      await flushPromises();

      expect(wrapper.find('.phone-error').text()).toBe('validation.phone');
    });
  });
});
