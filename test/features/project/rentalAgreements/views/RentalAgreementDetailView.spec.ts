import { mount, flushPromises, VueWrapper } from '@vue/test-utils';
import ProjectTenanciesDetails from '@/features/project/rentalAgreements/views/RentalAgreementDetailView.vue';
import TenancyDataComponent from '@/features/project/rentalAgreements/components/TenancyDataComponent.vue';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { rentalAgreementService } from '@/features/project/rentalAgreements/services/RentalAgreementService';

// ---- Mocks ----
const push = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => ({ params: { agreementId: 'agreement-1' } }),
}));

const toastSpy = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: toastSpy }), }));

// ---- Mock ProjectStore ----
vi.mock('@/stores/ProjectStore', () => ({useProjectStore: () => ({ projectId: 'proj-1' }),}));

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
    vi.spyOn(rentalAgreementService, 'updateRentalAgreement').mockResolvedValue(undefined);
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

  it('opens confirmation dialog when delete is clicked', async () => {
    const deleteBtn = wrapper
      .findAll('button').find((btn) => btn.text().includes('Löschen'));
    expect(deleteBtn).toBeTruthy();

    await deleteBtn!.trigger('click');
    expect((wrapper.vm as unknown as ProjectTenanciesDetailsExposed).confirmationDialogVisible).toBe(true);
  });

  it('calls updateRentalAgreement and shows toast', async () => {
    const saveBtn = wrapper
      .findAll('button').find((btn) => btn.text().includes('Speichern'));
    expect(saveBtn).toBeTruthy();

    await saveBtn!.trigger('click');
    await flushPromises();

    expect(rentalAgreementService.updateRentalAgreement).toHaveBeenCalledWith('proj-1', 'agreement-1', mockRentalAgreement);
    expect(toastSpy).toHaveBeenCalled();
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

  it('does not load the rental agreement when agreementId is missing', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(rentalAgreementService, 'getRentalAgreement').mockClear();

    const localWrapper = mount(ProjectTenanciesDetails, {props: { projectId: 'proj-1', agreementId: '' },});
    await flushPromises();

    expect(rentalAgreementService.getRentalAgreement).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Agreement ID or Project ID not found');

    localWrapper.unmount();
  });

  it('closes the dialog when the close button is used', async () => {
    const openBtn = wrapper.findAll('button').find((btn) => btn.text().includes('Löschen'));
    await openBtn!.trigger('click');
    await flushPromises();

    const closeBtn = document.querySelector('.p-dialog-close-button') as HTMLButtonElement;
    expect(closeBtn).not.toBeNull();
    closeBtn.click();
    await flushPromises();

    expect(document.querySelector('.p-dialog')).toBeNull();
  });

  it('updates the rental agreement when tenancy data changes', async () => {
    const updatedAgreement = {
      ...mockRentalAgreement,
      startOfRental: '2026-02-01',
      endOfRental: '2026-11-30',
    };

    await wrapper.findComponent(TenancyDataComponent).vm.$emit('onChange', updatedAgreement);
    await flushPromises();

    expect(wrapper.findComponent(TenancyDataComponent).props('tenancy')).toEqual(updatedAgreement);
  });
});
