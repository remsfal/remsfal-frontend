import { mount, flushPromises } from '@vue/test-utils';
import ProjectTenanciesDetails from '../../src/views/ProjectTenanciesDetails.vue';
import { it, expect, vi, beforeEach, describe } from 'vitest';
import PrimeVue from 'primevue/config';
import i18n from '../../src/i18n/i18n';
import { tenancyService } from '../../src/services/TenancyService';

// Mocks
const push = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => ({ params: { tenancyId: 't1' } }),
}));

const toastSpy = vi.fn();
vi.mock('primevue/usetoast', () => ({
  useToast: () => ({ add: toastSpy }),
}));

vi.mock('@/services/TenancyService', () => ({
  tenancyService: {
    loadMockTenancyData: vi.fn(),
    updateTenancy: vi.fn(),
    deleteTenancy: vi.fn(),
  },
}));

const mockTenancy = {
  id: 't1',
  rentalStart: new Date(),
  rentalEnd: new Date(),
  listOfTenants: [],
  listOfUnits: [],
  active: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  tenancyService.loadMockTenancyData.mockReturnValue(mockTenancy);
});

describe('ProjectTenanciesDetails', () => {
  it('opens confirmation dialog when delete is clicked', async () => {
    const wrapper = mount(ProjectTenanciesDetails, {
      global: { plugins: [PrimeVue, i18n] },
    });

    await flushPromises();

    const deleteBtn = wrapper.findAll('button').find(btn => btn.text().includes('Löschen'));
    expect(deleteBtn).toBeTruthy();

    await deleteBtn!.trigger('click');
    expect((wrapper.vm as any).confirmationDialogVisible).toBe(true);
  });

  it('calls updateTenancy and shows toast', async () => {
    const wrapper = mount(ProjectTenanciesDetails, {
      global: { plugins: [PrimeVue, i18n] },
    });

    await flushPromises();

    const saveBtn = wrapper.findAll('button').find(btn => btn.text().includes('Speichern'));
    expect(saveBtn).toBeTruthy();

    await saveBtn!.trigger('click');

    expect(tenancyService.updateTenancy).toHaveBeenCalledWith(mockTenancy);
    expect(toastSpy).toHaveBeenCalled();
  });

  it('deletes tenancy and redirects', async () => {
    tenancyService.deleteTenancy.mockResolvedValue(undefined);

    const wrapper = mount(ProjectTenanciesDetails, {
      global: { plugins: [PrimeVue, i18n] },
    });

    await flushPromises();

    (wrapper.vm as any).confirmDeletion();
    await flushPromises();

    expect(tenancyService.deleteTenancy).toHaveBeenCalledWith('t1');
    expect(push).toHaveBeenCalledWith(expect.stringContaining('/tenancies/'));
  });
});
