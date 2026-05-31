import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import AddressCard from '@/components/AddressCard.vue';

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
  let loadAddress: ReturnType<typeof vi.fn>;
  let saveAddress: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    loadAddress = vi.fn().mockResolvedValue({ ...mockAddress });
    saveAddress = vi.fn().mockResolvedValue(undefined);
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
    loadAddress = vi.fn().mockResolvedValue(undefined);
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
    saveAddress = vi.fn().mockRejectedValue(new Error('Network error'));
    const wrapper = mountCard();
    await flushPromises();
    await wrapper.find('input[name="street"]').setValue('Teststraße 1');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });

  it('does not throw when loadAddress rejects', async () => {
    loadAddress = vi.fn().mockRejectedValue(new Error('Not found'));
    const wrapper = mountCard();
    await expect(flushPromises()).resolves.not.toThrow();
    expect(wrapper.exists()).toBe(true);
  });
});
