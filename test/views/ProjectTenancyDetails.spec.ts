import { mount, flushPromises } from '@vue/test-utils';
import ProjectTenanciesDetails from '../../src/views/ProjectTenanciesDetails.vue';
import { describe, it, expect, vi, beforeEach, beforeAll, afterEach, afterAll } from 'vitest';
import PrimeVue from 'primevue/config';
import i18n from '../../src/i18n/i18n';
import { tenancyService } from '../../src/services/TenancyService';
import { setupServer } from 'msw/node';
import { handlers } from '../mocks/handlers';  // <-- import shared handlers

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

// ---- MSW Server ----
const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

// ---- Tests ----
describe('ProjectTenanciesDetails', () => {
  let wrapper: any;

  beforeEach(async () => {
    wrapper = mount(ProjectTenanciesDetails, {
      global: { plugins: [PrimeVue, i18n] },
    });
    await flushPromises();
  });

  it('opens confirmation dialog when delete is clicked', async () => {
    const deleteBtn = wrapper.findAll('button').find((btn) => btn.text().includes('Löschen'));
    expect(deleteBtn).toBeTruthy();

    await deleteBtn!.trigger('click');
    expect(wrapper.vm.confirmationDialogVisible).toBe(true);
  });

  it('calls updateTenancy and shows toast', async () => {
    // Override tenancyService.updateTenancy to call fetch (MSW intercepts)
    vi.spyOn(tenancyService, 'updateTenancy').mockImplementation(async (tenancy) => {
      const res = await fetch(`/api/v1/tenancies/${tenancy.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenancy),
      });
      return res.json();
    });

    const saveBtn = wrapper.findAll('button').find((btn) => btn.text().includes('Speichern'));
    expect(saveBtn).toBeTruthy();

    await saveBtn!.trigger('click');

    expect(tenancyService.updateTenancy).toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalled();
  });

  it('deletes tenancy and redirects', async () => {
    // Override tenancyService.deleteTenancy to call fetch (MSW intercepts)
    vi.spyOn(tenancyService, 'deleteTenancy').mockImplementation(async (tenancyId) => {
      await fetch(`/api/v1/tenancies/${tenancyId}`, { method: 'DELETE' });
    });

    wrapper.vm.confirmDeletion();
    await flushPromises();

    expect(tenancyService.deleteTenancy).toHaveBeenCalledWith('t1');
    expect(push).toHaveBeenCalledWith(expect.stringContaining('/tenancies/'));
  });
});
