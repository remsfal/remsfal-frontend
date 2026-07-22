import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises, DOMWrapper } from '@vue/test-utils';
import AddressCard from '@/components/AddressCard.vue';
import type { AddressJson } from '@/services/AddressService';

// PrimeVue Select teleports its overlay (option list) to document.body, so it must
// be located via a DOMWrapper rooted at document.body rather than the mounted wrapper.
function body(): DOMWrapper<HTMLElement> {
  return new DOMWrapper(document.body);
}

vi.mock('@/services/AddressService', () => ({
  default: vi.fn().mockImplementation(() =>
    ({getCityFromZip: vi.fn().mockResolvedValue(null),})),
})
);

const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

const mockAddress = {
  street: 'Musterstraße 42',
  zip: '13507',
  city: 'Berlin',
  province: 'Berlin',
  countryCode: 'DE',
};

describe('AddressCard.vue', () => {
  let loadAddress: ReturnType<typeof vi.fn<() => Promise<AddressJson | undefined>>>;
  let saveAddress: ReturnType<typeof vi.fn<(addr: AddressJson) => Promise<void>>>;

  beforeEach(() => {
    vi.clearAllMocks();
    loadAddress = vi.fn<() => Promise<AddressJson | undefined>>().mockResolvedValue({ ...mockAddress });
    saveAddress = vi.fn<(addr: AddressJson) => Promise<void>>().mockResolvedValue(undefined);
  });

  const mountCard = (overrides?: Partial<{ title: string }>) =>
    mount(AddressCard, {
      props: {
        loadAddress, saveAddress, ...overrides 
      } 
    });

  it('renders without Vue errors when a countryCode is pre-loaded', async () => {
    // Regression: #value slot called countryFlagEmoji(value.code), but with
    // optionValue="code" PrimeVue passes the code string directly to the slot —
    // value.code is undefined on a string, causing TypeError in countryFlagEmoji.
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mountCard();
    await flushPromises();

    const hasTypeError = consoleSpy.mock.calls.some((args) =>
      String(args[0]).includes('toUpperCase') || String(args[0]).includes('countryFlagEmoji'),
    );
    expect(hasTypeError).toBe(false);
    consoleSpy.mockRestore();
  });

  it('renders without errors when loadAddress returns undefined', async () => {
    loadAddress = vi.fn<() => Promise<AddressJson | undefined>>().mockResolvedValue(undefined);
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.find('form').exists()).toBe(true);
  });

  it('calls loadAddress on mount', async () => {
    mountCard();
    await flushPromises();
    expect(loadAddress).toHaveBeenCalledOnce();
  });

  it('renders all field labels', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Straße und Hausnummer');
    expect(wrapper.text()).toContain('Postleitzahl');
    expect(wrapper.text()).toContain('Stadt');
    expect(wrapper.text()).toContain('Bundesland');
    expect(wrapper.text()).toContain('Land');
  });

  it('renders the default title "Adresse"', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Adresse');
  });

  it('renders a custom title when provided', async () => {
    const wrapper = mountCard({ title: 'Organisationsanschrift' });
    await flushPromises();
    expect(wrapper.text()).toContain('Organisationsanschrift');
  });

  it('save button is disabled before any changes', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
  });

  it('save button is enabled after changing a text field', async () => {
    const wrapper = mountCard();
    await flushPromises();
    await wrapper.find('input[name="street"]').setValue('Teststraße 1');
    await flushPromises();
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
  });

  it('save button is enabled after changing the province field', async () => {
    const wrapper = mountCard();
    await flushPromises();
    await wrapper.find('input[name="province"]').setValue('Bayern');
    await flushPromises();
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
  });

  it('save button is enabled after changing the city field', async () => {
    const wrapper = mountCard();
    await flushPromises();
    await wrapper.find('input[name="city"]').setValue('München');
    await flushPromises();
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
  });

  it('shows a validation error when the street field is cleared and blurred', async () => {
    const wrapper = mountCard();
    await flushPromises();
    const street = wrapper.find('input[name="street"]');
    await street.setValue('');
    await street.trigger('blur');
    await flushPromises();
    expect(wrapper.text()).toContain('Dieses Feld ist erforderlich');
  });

  it('shows a validation error when the city field is cleared and blurred', async () => {
    const wrapper = mountCard();
    await flushPromises();
    const city = wrapper.find('input[name="city"]');
    await city.setValue('');
    await city.trigger('blur');
    await flushPromises();
    expect(wrapper.text()).toContain('Dieses Feld ist erforderlich');
  });

  it('shows a validation error when the province field is cleared and blurred', async () => {
    const wrapper = mountCard();
    await flushPromises();
    const province = wrapper.find('input[name="province"]');
    await province.setValue('');
    await province.trigger('blur');
    await flushPromises();
    expect(wrapper.text()).toContain('Dieses Feld ist erforderlich');
  });

  it('shows a validation error when the zip field is cleared and blurred', async () => {
    const wrapper = mountCard();
    await flushPromises();
    const zip = wrapper.find('input[name="zip"]');
    await zip.setValue('');
    await zip.trigger('blur');
    await flushPromises();
    expect(wrapper.text()).toContain('Dieses Feld ist erforderlich');
  });

  it('save button is enabled after changing the zip field and blurring it', async () => {
    const wrapper = mountCard();
    await flushPromises();
    const zip = wrapper.find('input[name="zip"]');
    await zip.setValue('99999');
    await zip.trigger('blur');
    await flushPromises();
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
  });

  it('updates the country via the select dropdown and renders the flag option', async () => {
    const wrapper = mountCard();
    await flushPromises();

    await wrapper.find('#countryCode').trigger('click');
    await flushPromises();

    const option = body()
      .findAll('li[role="option"]')
      .find((li) => li.text().includes('Österreich'));
    expect(option).toBeTruthy();
    await option!.trigger('mousedown');
    await flushPromises();

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
    expect(wrapper.text()).toContain('Österreich');
  });

  it('calls saveAddress with the updated street on submit', async () => {
    const wrapper = mountCard();
    await flushPromises();
    await wrapper.find('input[name="street"]').setValue('Teststraße 1');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    expect(saveAddress).toHaveBeenCalledWith(
      expect.objectContaining({ street: 'Teststraße 1', city: 'Berlin' }),
    );
  });

  it('shows success toast after successful save', async () => {
    const wrapper = mountCard();
    await flushPromises();
    await wrapper.find('input[name="street"]').setValue('Teststraße 1');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('shows error toast when saveAddress rejects', async () => {
    saveAddress = vi.fn<(addr: AddressJson) => Promise<void>>().mockRejectedValue(new Error('Network error'));
    const wrapper = mountCard();
    await flushPromises();
    await wrapper.find('input[name="street"]').setValue('Teststraße 1');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });

  it('does not throw when loadAddress rejects', async () => {
    loadAddress = vi.fn<() => Promise<AddressJson | undefined>>().mockRejectedValue(new Error('Not found'));
    const wrapper = mountCard();
    await expect(flushPromises()).resolves.not.toThrow();
    expect(wrapper.exists()).toBe(true);
  });
});
