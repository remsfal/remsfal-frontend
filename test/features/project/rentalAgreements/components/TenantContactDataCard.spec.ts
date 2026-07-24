import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises, VueWrapper } from '@vue/test-utils';
import { Form } from '@primevue/forms';
import TenantContactDataCard from '@/features/project/rentalAgreements/components/TenantContactDataCard.vue';
import { tenantService } from '@/features/project/rentalAgreements/services/TenantService';

const push = vi.fn();
vi.mock('vue-router', () => ({useRouter: () => ({ push }),}));

vi.mock('@/features/project/rentalAgreements/services/TenantService', () => ({
  tenantService: {
    getTenant: vi.fn(),
    updateTenant: vi.fn(),
  },
}));

const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

const mockTenant = {
  id: 'tenant-1',
  firstName: 'Max',
  lastName: 'Mustermann',
  email: 'max@example.com',
  placeOfBirth: 'Berlin',
  dateOfBirth: '1990-01-01',
  mobilePhoneNumber: '',
  businessPhoneNumber: '',
  privatePhoneNumber: '',
  address: {
    street: 'Musterstraße 1', zip: '12345', city: 'Berlin', province: 'Berlin', countryCode: 'DE' 
  },
};

describe('TenantContactDataCard', () => {
  let wrapper: VueWrapper;

  const mountCard = () =>
    mount(TenantContactDataCard, {
      props: { projectId: 'project-1', tenantId: 'tenant-1' },
      global: { stubs: { PhoneInput: true } },
    });

  beforeEach(() => {
    push.mockClear();
    vi.mocked(tenantService.getTenant).mockResolvedValue({ ...mockTenant });
    vi.mocked(tenantService.updateTenant).mockResolvedValue({ ...mockTenant });
    wrapper = mountCard();
  });

  test('renders without errors', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('loads the tenant on mount', async () => {
    await flushPromises();

    expect(tenantService.getTenant).toHaveBeenCalledWith('project-1', 'tenant-1');
    expect((wrapper.find('input[name="firstName"]').element as HTMLInputElement).value).toBe(
      'Max',
    );
    expect((wrapper.find('input[name="email"]').element as HTMLInputElement).value).toBe(
      'max@example.com',
    );
  });

  test('shows the tenant name in the card title once loaded', async () => {
    await flushPromises();

    expect(wrapper.text()).toContain('Kontaktdaten von Max Mustermann');
  });

  test('redirects to the tenant list when loading fails', async () => {
    vi.mocked(tenantService.getTenant).mockRejectedValue(new Error('not found'));

    wrapper = mountCard();
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    expect(push).toHaveBeenCalledWith({ name: 'TenantList', params: { projectId: 'project-1' } });
  });

  test('submits updated contact data and preserves the previously loaded address', async () => {
    await flushPromises();
    vi.mocked(tenantService.updateTenant).mockResolvedValue({ ...mockTenant, firstName: 'Erika' });

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: {
        firstName: { value: 'Erika' },
        lastName: { value: 'Mustermann' },
        email: { value: 'max@example.com' },
        placeOfBirth: { value: 'Berlin' },
      },
    });
    await flushPromises();

    expect(tenantService.updateTenant).toHaveBeenCalledWith(
      'project-1',
      'tenant-1',
      expect.objectContaining({ firstName: 'Erika', address: mockTenant.address }),
    );
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  test('does not submit when the form is invalid', async () => {
    await flushPromises();

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', { valid: false, states: {} });
    await flushPromises();

    expect(tenantService.updateTenant).not.toHaveBeenCalled();
  });

  test('shows phone validation errors for invalid numbers and blocks submit', async () => {
    await flushPromises();

    const phoneInputs = wrapper.findAllComponents({ name: 'PhoneInput' });
    await phoneInputs[0].vm.$emit('update:modelValue', 'invalid');
    await flushPromises();

    expect(wrapper.text()).toContain('Ungültiges Telefonformat');

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: {firstName: { value: 'Max' }, lastName: { value: 'Mustermann' }},
    });
    await flushPromises();

    expect(tenantService.updateTenant).not.toHaveBeenCalled();
  });

  test('shows an error toast when saving fails', async () => {
    await flushPromises();
    vi.mocked(tenantService.updateTenant).mockRejectedValue(new Error('save failed'));

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: {firstName: { value: 'Max' }, lastName: { value: 'Mustermann' }},
    });
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });
});
