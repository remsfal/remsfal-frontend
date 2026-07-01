import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineComponent } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { useI18n } from 'vue-i18n';
import { z } from 'zod';
import { useAddressForm, buildAddressSchema } from '@/composables/useAddressForm';
import type { FormSubmitEvent } from '@primevue/forms';

const { getCityFromZipMock, MockAddressService } = vi.hoisted(() => {
  const getCityFromZipMock = vi.fn();
  class MockAddressService {
    getCityFromZip = getCityFromZipMock;
  }
  return { getCityFromZipMock, MockAddressService };
});
vi.mock('@/services/AddressService', () => ({ default: MockAddressService }));

const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

const mockAddress = {
  street: 'Musterstraße 42', zip: '13507', city: 'Berlin', province: 'Berlin', countryCode: 'DE',
};

function mockFormEvent(values: Record<string, string>, valid = true): FormSubmitEvent {
  return {
    valid,
    states: Object.fromEntries(Object.entries(values).map(([k, v]) => [k, { value: v }])),
  } as unknown as FormSubmitEvent;
}

function mountForm(options: Parameters<typeof useAddressForm>[0]) {
  const TestComponent = defineComponent({
    setup() {
      return { ...useAddressForm(options) };
    },
    template: '<div></div>',
  });
  return mount(TestComponent);
}

describe('useAddressForm', () => {
  let load: ReturnType<typeof vi.fn>;
  let save: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    getCityFromZipMock.mockResolvedValue(null);
    load = vi.fn().mockResolvedValue({ ...mockAddress });
    save = vi.fn().mockResolvedValue(undefined);
  });

  it('populates currentValues/initialValues from load() on mount', async () => {
    const wrapper = mountForm({ load, save });
    await flushPromises();

    expect(load).toHaveBeenCalledOnce();
    expect(wrapper.vm.currentValues).toMatchObject(mockAddress);
    expect(wrapper.vm.initialValues).toMatchObject(mockAddress);
  });

  it('isDirty is false after load and true after a field changes', async () => {
    const wrapper = mountForm({ load, save });
    await flushPromises();

    expect(wrapper.vm.isDirty).toBe(false);
    wrapper.vm.currentValues.street = 'Neue Straße 1';
    await flushPromises();
    expect(wrapper.vm.isDirty).toBe(true);
  });

  it('handleZipBlur fills city/province/countryCode and bumps formKey', async () => {
    getCityFromZipMock.mockResolvedValue({
      city: 'Hamburg', province: 'Hamburg', countryCode: 'DE' 
    });
    const wrapper = mountForm({ load, save });
    await flushPromises();

    const keyBefore = wrapper.vm.formKey;
    wrapper.vm.currentValues.zip = '20095';
    await wrapper.vm.handleZipBlur();
    await flushPromises();

    expect(getCityFromZipMock).toHaveBeenCalledWith('20095');
    expect(wrapper.vm.currentValues.city).toBe('Hamburg');
    expect(wrapper.vm.currentValues.province).toBe('Hamburg');
    expect(wrapper.vm.formKey).toBeGreaterThan(keyBefore);
  });

  it('onSubmit is a no-op when the form is invalid', async () => {
    const wrapper = mountForm({ load, save });
    await flushPromises();

    await wrapper.vm.onSubmit(mockFormEvent(mockAddress, false));
    await flushPromises();

    expect(save).not.toHaveBeenCalled();
  });

  it('onSubmit calls save() with the submitted payload and shows a success toast', async () => {
    const wrapper = mountForm({ load, save });
    await flushPromises();

    await wrapper.vm.onSubmit(mockFormEvent({ ...mockAddress, street: 'Teststraße 1' }));
    await flushPromises();

    expect(save).toHaveBeenCalledWith(expect.objectContaining({ street: 'Teststraße 1' }));
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    expect(wrapper.vm.isDirty).toBe(false);
  });

  it('onSubmit shows an error toast and logs when save() rejects', async () => {
    save = vi.fn().mockRejectedValue(new Error('boom'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mountForm({
      load, save, errorLogLabel: 'custom save error' 
    });
    await flushPromises();

    await wrapper.vm.onSubmit(mockFormEvent(mockAddress));
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    expect(consoleErrorSpy).toHaveBeenCalledWith('custom save error', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  it('logs with loadErrorLogLabel when load() rejects', async () => {
    load = vi.fn().mockRejectedValue(new Error('load failed'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mountForm({
      load, save, loadErrorLogLabel: 'custom load error' 
    });
    await flushPromises();

    expect(consoleErrorSpy).toHaveBeenCalledWith('custom load error', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  it('supports extraFieldDefaults: seeds, tracks dirty state, and includes them in the save payload', async () => {
    load = vi.fn().mockResolvedValue({
      ...mockAddress, owner: 'Alice', careOf: 'Bob' 
    });
    const wrapper = mountForm({
      load, save, extraFieldDefaults: { owner: '', careOf: '' },
    });
    await flushPromises();

    expect(wrapper.vm.currentValues.owner).toBe('Alice');
    expect(wrapper.vm.currentValues.careOf).toBe('Bob');
    expect(wrapper.vm.isDirty).toBe(false);

    wrapper.vm.currentValues.owner = 'Carol';
    await flushPromises();
    expect(wrapper.vm.isDirty).toBe(true);

    await wrapper.vm.onSubmit(mockFormEvent({
      ...mockAddress, owner: 'Carol', careOf: 'Bob' 
    }));
    await flushPromises();

    expect(save).toHaveBeenCalledWith(expect.objectContaining({ owner: 'Carol', careOf: 'Bob' }));
  });
});

describe('buildAddressSchema', () => {
  function schemaWithT() {
    const TestComponent = defineComponent({
      setup() {
        const { t } = useI18n();
        return { schema: buildAddressSchema(t) };
      },
      template: '<div></div>',
    });
    return mount(TestComponent).vm.schema;
  }

  it('rejects an empty address and accepts a valid one', () => {
    const schema = schemaWithT();
    expect(schema.safeParse({}).success).toBe(false);
    expect(schema.safeParse(mockAddress).success).toBe(true);
  });

  it('rejects city/province values containing digits', () => {
    const schema = schemaWithT();
    expect(schema.safeParse({ ...mockAddress, city: 'Berlin1' }).success).toBe(false);
  });

  it('merges an extra shape without breaking base validation', () => {
    const TestComponent = defineComponent({
      setup() {
        const { t } = useI18n();
        return {schema: buildAddressSchema(t, { owner: z.string().trim().optional() }),};
      },
      template: '<div></div>',
    });
    const wrapper = mount(TestComponent);
    expect(wrapper.vm.schema.safeParse(mockAddress).success).toBe(true);
    expect(wrapper.vm.schema.safeParse({ ...mockAddress, owner: 'Alice' }).success).toBe(true);
  });
});
