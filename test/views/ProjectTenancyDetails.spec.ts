import { mount, flushPromises } from '@vue/test-utils';
import ProjectTenanciesDetails from '../../src/views/ProjectTenanciesDetails.vue';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PrimeVue from 'primevue/config';
import i18n from '../../src/i18n/i18n';
import { tenancyService } from '../../src/services/TenancyService';

// ---- Mocks ----
const push = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => ({ params: { tenancyId: 't1' } }),
}));

const toastSpy = vi.fn();
vi.mock('primevue/usetoast', () => ({
  useToast: () => ({ add: toastSpy }),
}));

// ---- Mock window.location.href ----
Object.defineProperty(window, 'location', {
  value: { href: 'http://localhost/project/1/tenancies/t1' },
  writable: true,
});

const mockTenancy = {
  id: 't1',
  active: true,
  tenants: [],
  startOfRental: '2025-01-01',
  endOfRental: '2025-12-31',
};

describe('ProjectTenanciesDetails', () => {
  let wrapper: any;

  beforeEach(async () => {
    // re-apply mocks here (so they're active after vi.clearAllMocks)
    vi.spyOn(tenancyService, 'loadTenancyData').mockResolvedValue(mockTenancy);
    vi.spyOn(tenancyService, 'updateTenancy').mockResolvedValue(undefined);
    vi.spyOn(tenancyService, 'deleteTenancy').mockResolvedValue(undefined);

    wrapper = mount(ProjectTenanciesDetails, {
      global: { plugins: [PrimeVue, i18n] },
    });
    await flushPromises();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('opens confirmation dialog when delete is clicked', async () => {
    const deleteBtn = wrapper.findAll('button').find((btn) => btn.text().includes('Löschen'));
    expect(deleteBtn).toBeTruthy();

    await deleteBtn!.trigger('click');
    expect(wrapper.vm.confirmationDialogVisible).toBe(true);
  });

  it('calls updateTenancy and shows toast', async () => {
    const saveBtn = wrapper.findAll('button').find((btn) => btn.text().includes('Speichern'));
    expect(saveBtn).toBeTruthy();

    await saveBtn!.trigger('click');
    await flushPromises();

    expect(tenancyService.updateTenancy).toHaveBeenCalledWith(mockTenancy);
    expect(toastSpy).toHaveBeenCalled();
  });

  it('deletes tenancy and redirects', async () => {
    wrapper.vm.confirmationDialogVisible = true;
    await wrapper.vm.confirmDeletion();
    await flushPromises();

    expect(tenancyService.deleteTenancy).toHaveBeenCalledWith('t1');
    expect(push).toHaveBeenCalledWith(expect.stringContaining('/tenancies/'));
  });
});
