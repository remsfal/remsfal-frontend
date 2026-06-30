import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import BillingAddressCard from '@/components/BillingAddressCard.vue';
import { projectService } from '@/services/ProjectService';

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

const mockProject = {
  title: 'Projekt Muster',
  owner: 'Leistungsempfänger Alt',
  careOf: 'Vertreter Alt',
  address: {
    street: 'Musterstraße 1',
    zip: '12345',
    city: 'Berlin',
    province: 'Berlin',
    countryCode: 'DE',
  },
};

describe('BillingAddressCard.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCityFromZipMock.mockResolvedValue(null);
    vi.spyOn(projectService, 'getProject').mockResolvedValue({ ...mockProject });
    vi.spyOn(projectService, 'updateProject').mockResolvedValue({ ...mockProject });
  });

  const mountCard = () =>
    mount(BillingAddressCard, { props: { projectId: 'proj-1' } });

  it('loads project billing recipient data on mount', async () => {
    const wrapper = mountCard();
    await flushPromises();

    expect(projectService.getProject).toHaveBeenCalledWith('proj-1');
    expect((wrapper.find('input[name="owner"]').element as HTMLInputElement).value).toBe('Leistungsempfänger Alt');
    expect((wrapper.find('input[name="careOf"]').element as HTMLInputElement).value).toBe('Vertreter Alt');
  });

  it('saves owner, careOf and address in project update payload', async () => {
    const wrapper = mountCard();
    await flushPromises();

    await wrapper.find('input[name="owner"]').setValue('Leistungsempfänger Neu');
    await wrapper.find('input[name="careOf"]').setValue('Vertreter Neu');
    await wrapper.find('input[name="street"]').setValue('Neue Straße 2');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(projectService.updateProject).toHaveBeenCalledWith(
      'proj-1',
      expect.objectContaining({
        title: 'Projekt Muster',
        owner: 'Leistungsempfänger Neu',
        careOf: 'Vertreter Neu',
        address: expect.objectContaining({
          street: 'Neue Straße 2',
          zip: '12345',
          city: 'Berlin',
          province: 'Berlin',
          countryCode: 'DE',
        }),
      }),
    );
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('fills city, province and country from zip lookup on blur', async () => {
    getCityFromZipMock.mockResolvedValue({
      city: 'Hamburg',
      province: 'Hamburg',
      countryCode: 'DE',
    });
    const wrapper = mountCard();
    await flushPromises();

    await wrapper.find('input[name="zip"]').setValue('20095');
    await wrapper.find('input[name="zip"]').trigger('blur');
    await flushPromises();

    expect(getCityFromZipMock).toHaveBeenCalledWith('20095');
    expect((wrapper.find('input[name="city"]').element as HTMLInputElement).value).toBe('Hamburg');
    expect((wrapper.find('input[name="province"]').element as HTMLInputElement).value).toBe('Hamburg');
  });

  it('shows error toast when saving fails', async () => {
    vi.spyOn(projectService, 'updateProject').mockRejectedValue(new Error('save failed'));

    const wrapper = mountCard();
    await flushPromises();

    await wrapper.find('input[name="street"]').setValue('Neue Straße 2');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });

  it('handles project loading failure', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(projectService, 'getProject').mockRejectedValue(new Error('load failed'));

    mountCard();
    await flushPromises();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to load billing recipient data',
      expect.any(Error),
    );
    consoleErrorSpy.mockRestore();
  });
});
