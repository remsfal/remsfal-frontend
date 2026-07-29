import { mount, flushPromises, VueWrapper } from '@vue/test-utils';
import ProjectTenanciesDetails from '@/features/project/rentalAgreements/views/RentalAgreementDetailView.vue';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { rentalAgreementService } from '@/features/project/rentalAgreements/services/RentalAgreementService';
import { issueService } from '@/services/IssueService';

// ---- Mocks ----
const push = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => ({ params: { agreementId: 'agreement-1' } }),
}));

// ---- Mock ProjectStore ----
vi.mock('@/stores/ProjectStore', () => ({useProjectStore: () => ({ projectId: 'proj-1' }),}));

const toastSpy = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: toastSpy }) }));

// ---- Mock window.location.href ----
Object.defineProperty(window, 'location', {
  value: { href: 'http://localhost/project/proj-1/agreements/agreement-1' },
  writable: true,
});

const mockRentalAgreement = {
  id: 'agreement-1',
  active: true,
  tenants: [],
  startOfRental: '2025-01-01',
  endOfRental: '2025-12-31',
  apartmentRents: [],
  propertyRents: [],
  siteRents: [],
  buildingRents: [],
  storageRents: [],
  commercialRents: []
};

describe('ProjectTenanciesDetails', () => {
  interface ProjectTenanciesDetailsExposed {
    confirmationDialogVisible: boolean;
    confirmDeletion: () => void;
  }

  let wrapper: VueWrapper<InstanceType<typeof ProjectTenanciesDetails>>;

  beforeEach(async () => {
    // re-apply mocks here (so they're active after vi.clearAllMocks)
    vi.spyOn(rentalAgreementService, 'getRentalAgreement').mockResolvedValue(mockRentalAgreement);
    vi.spyOn(rentalAgreementService, 'deleteRentalAgreement').mockResolvedValue(undefined);

    wrapper = mount(ProjectTenanciesDetails, {
      props: {
        projectId: 'proj-1',
        agreementId: 'agreement-1'
      },
      attachTo: document.body,
    });
    await flushPromises();
  });

  afterEach(() => {
    vi.clearAllMocks();
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('deletes rental agreement and redirects', async () => {
    (wrapper.vm as unknown as ProjectTenanciesDetailsExposed).confirmationDialogVisible = true;
    await (wrapper.vm as unknown as ProjectTenanciesDetailsExposed).confirmDeletion();
    await flushPromises();

    expect(rentalAgreementService.deleteRentalAgreement).toHaveBeenCalledWith('proj-1', 'agreement-1');
    expect(push).toHaveBeenCalledWith({
      name: 'RentalAgreementView',
      params: { projectId: 'proj-1' }
    });
  });

  it('logs an error when loading issues fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(issueService, 'getIssues').mockRejectedValue(new Error('network error'));

    const localWrapper = mount(ProjectTenanciesDetails, {props: { projectId: 'proj-1', agreementId: 'agreement-1' },});
    await flushPromises();

    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));

    localWrapper.unmount();
  });

  it('falls back to an empty issues list when the response has no issues field', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // @ts-expect-error - intentionally missing the `issues` field to exercise the `?? []` fallback
    vi.spyOn(issueService, 'getIssues').mockResolvedValue({});

    const localWrapper = mount(ProjectTenanciesDetails, {props: { projectId: 'proj-1', agreementId: 'agreement-1' },});
    await flushPromises();

    expect(consoleSpy).not.toHaveBeenCalled();

    localWrapper.unmount();
  });

  it('shows a success toast and redirects when deleting via the danger zone succeeds', async () => {
    const deleteBtn = wrapper.findComponent({ name: 'DangerZoneCard' }).find('button');
    await deleteBtn.trigger('click');
    await flushPromises();

    const confirmBtn = Array.from(document.querySelectorAll('.p-dialog button')).find(
      (btn) => btn.textContent?.trim() === 'Endgültig löschen',
    ) as HTMLButtonElement;
    expect(confirmBtn).toBeTruthy();
    confirmBtn.click();
    await flushPromises();

    expect(rentalAgreementService.deleteRentalAgreement).toHaveBeenCalledWith('proj-1', 'agreement-1');
    expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    expect(push).toHaveBeenCalledWith({
      name: 'RentalAgreementView',
      params: { projectId: 'proj-1' },
    });
  });

  it('shows an error toast and does not redirect when deleting via the danger zone fails', async () => {
    vi.spyOn(rentalAgreementService, 'deleteRentalAgreement').mockRejectedValueOnce(new Error('network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const deleteBtn = wrapper.findComponent({ name: 'DangerZoneCard' }).find('button');
    await deleteBtn.trigger('click');
    await flushPromises();

    const confirmBtn = Array.from(document.querySelectorAll('.p-dialog button')).find(
      (btn) => btn.textContent?.trim() === 'Endgültig löschen',
    ) as HTMLButtonElement;
    confirmBtn.click();
    await flushPromises();

    expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    expect(push).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Error deleting rental agreement:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('does not load the rental agreement when agreementId is missing', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(rentalAgreementService, 'getRentalAgreement').mockClear();

    const localWrapper = mount(ProjectTenanciesDetails, {props: { projectId: 'proj-1', agreementId: '' },});
    await flushPromises();

    expect(rentalAgreementService.getRentalAgreement).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Agreement ID or Project ID not found');

    localWrapper.unmount();
  });
});
