import { mount, flushPromises } from '@vue/test-utils';
import ProjectTenanciesDetails from '../../src/views/ProjectTenanciesDetails.vue';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import { tenancyService } from '../../src/services/TenancyService';

// ---- Mocks ----
vi.mock('../../src/services/TenancyService', () => ({
  tenancyService: {
    loadTenancyData: vi.fn(),
    updateTenancy: vi.fn(),
    deleteTenancy: vi.fn(),
  },
}));

const push = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => ({ params: { tenancyId: 't1' } }),
}));

const toastSpy = vi.fn();
vi.mock('primevue/usetoast', () => ({useToast: () => ({ add: toastSpy }),}));

const mockTenancy = {
  id: 't1',
  active: true,
  tenants: [],
  startOfRental: '2025-01-01',
  endOfRental: '2025-12-31',
};

describe('ProjectTenanciesDetails', () => {
  let wrapper: any;

  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({}),
    text: async () => '',
  });

  beforeEach(async () => {
    vi.useFakeTimers();

    window.history.pushState({}, '', '/project/1/tenancies/t1');

    vi.stubGlobal('fetch', fetchMock);

    // re-apply mocks here (so they're active after vi.clearAllMocks)
    vi.mocked(tenancyService.loadTenancyData).mockResolvedValue(mockTenancy as any);
    vi.mocked(tenancyService.updateTenancy).mockResolvedValue(undefined as any);
    vi.mocked(tenancyService.deleteTenancy).mockResolvedValue(undefined as any);

    wrapper = mount(ProjectTenanciesDetails);
    await flushPromises();

    vi.runOnlyPendingTimers();
    await flushPromises();
  });

  afterEach(async () => {
    wrapper?.unmount?.();

    vi.runOnlyPendingTimers();
    vi.clearAllTimers();
    await flushPromises();

    vi.unstubAllGlobals();
    vi.clearAllMocks();

    vi.useRealTimers();
  });

  it('opens confirmation dialog when delete is clicked', async () => {
    const deleteBtn = wrapper.findAll('button').find((btn: any) => btn.text().includes('Löschen'));
    expect(deleteBtn).toBeTruthy();

    await deleteBtn!.trigger('click');
    await flushPromises();
    expect(wrapper.vm.confirmationDialogVisible).toBe(true);
  });

  it('calls updateTenancy and shows toast', async () => {
    const saveBtn = wrapper.findAll('button').find((btn: any) => btn.text().includes('Speichern'));
    expect(saveBtn).toBeTruthy();

    await saveBtn!.trigger('click');
    await flushPromises();

    expect(tenancyService.updateTenancy).toHaveBeenCalled();
     const firstCallArgs = vi.mocked(tenancyService.updateTenancy).mock.calls[0];
    expect(firstCallArgs[0]).toEqual(mockTenancy);

    expect(toastSpy).toHaveBeenCalled();
  });

  it('deletes tenancy and redirects', async () => {
    wrapper.vm.confirmationDialogVisible = true;
    await wrapper.vm.confirmDeletion();
    await flushPromises();

    expect(tenancyService.deleteTenancy).toHaveBeenCalled();

     const delArgs = vi.mocked(tenancyService.deleteTenancy).mock.calls[0];
    expect(delArgs[0]).toBe('t1');
    
    expect(push).toHaveBeenCalledWith(expect.stringContaining('/tenancies/'));
  });
});