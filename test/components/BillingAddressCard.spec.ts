import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import BillingAddressCard from '@/components/BillingAddressCard.vue';
import { projectService } from '@/services/ProjectService';

vi.mock('@/services/AddressService', () => ({
  default: vi.fn().mockImplementation(() =>
    ({getCityFromZip: vi.fn().mockResolvedValue(null),})),
}));

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
});
