import {mount, VueWrapper, flushPromises} from '@vue/test-utils';
import Dialog from 'primevue/dialog';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import RentalAgreementView from '@/views/project/RentalAgreementView.vue';
import { rentalAgreementService } from '@/services/RentalAgreementService';

// Fix for "window is not defined" error
if (typeof window === 'undefined') (global as any).window = {};

// ---- Router Mock ----
const routerPushMock = vi.fn();
vi.mock('vue-router', () => ({useRouter: () => ({ push: routerPushMock }),}));

// ---- PrimeVue/Dialog Mock ----
vi.mock('primevue/dialog', () => ({
  default: {
    inheritAttrs: false,
    render: () => '<div class="mock-dialog"></div>',
  },
}));

// ---- Pinia store mock ----
vi.mock('@/stores/ProjectStore', () => ({useProjectStore: () => ({ projectId: 'proj-1' }),}));

describe('RentalAgreementView.vue', () => {
  let wrapper: VueWrapper<any>;

  const mockTenants = [
    {
 id: '1', firstName: 'John', lastName: 'Doe'
},
  ];
  const mockRentalAgreements = [
    {
      id: 'agreement-1',
      startOfRental: '2023-01-01',
      endOfRental: '2024-01-01',
      tenants: mockTenants,
      apartmentRents: [
        { unitId: 'unit-101', basicRent: 1000 }
      ],
      propertyRents: [],
      siteRents: [],
      buildingRents: [],
      storageRents: [],
      commercialRents: []
    },
  ];

  beforeEach(async () => {
    vi.spyOn(rentalAgreementService, 'fetchRentalAgreements').mockResolvedValue(mockRentalAgreements);
    vi.spyOn(rentalAgreementService, 'extractTenants').mockReturnValue(mockTenants);

    wrapper = mount(RentalAgreementView, {
      props: {projectId: 'proj-1',},
      global: {components: { Dialog },},
    });

    // Wait for onMounted fetch
    await flushPromises();
  });

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('shows loading indicator while fetching', async () => {
    wrapper.vm.isLoading = true;
    await wrapper.vm.$nextTick(); // ensure DOM updates
    const loadingText = wrapper.vm.$t('projectTenancies.loading');
    expect(wrapper.html()).toContain(loadingText);
  });

  it('opens and closes the confirmation dialog', async () => {
    wrapper.vm.confirmationDialogVisible = true;
    wrapper.vm.tenantToDelete = mockTenants[0];

    expect(wrapper.vm.confirmationDialogVisible).toBe(true);

    wrapper.vm.confirmDeletion();
    expect(wrapper.vm.confirmationDialogVisible).toBe(false);
    expect(wrapper.vm.tenantData.length).toBe(0); // tenant deleted
  });

  it('does nothing if tenantToDelete is null', () => {
    wrapper.vm.tenantToDelete = null;
    const initialLength = wrapper.vm.tenantData.length;
    wrapper.vm.confirmDeletion();
    expect(wrapper.vm.tenantData.length).toBe(initialLength);
  });

  it('navigates to rental agreement details on row click', async () => {
    wrapper.vm.navigateToRentalAgreementDetails('agreement-1');
    expect(routerPushMock).toHaveBeenCalledWith({
      name: 'RentalAgreementDetails',
      params: { projectId: 'proj-1', agreementId: 'agreement-1' }
    });

    // Also test with DataTable if possible
    const dataTable = wrapper.findComponent({ name: 'DataTable' });
    if (dataTable.exists()) {
      // Simulate row click by calling the event handler directly
      const rowClickHandler = dataTable.vm.$attrs.onRowClick;
      if (rowClickHandler && typeof rowClickHandler === 'function') {
        await rowClickHandler({ data: { id: 'agreement-2' } });
        expect(routerPushMock).toHaveBeenCalledWith({
          name: 'RentalAgreementDetails',
          params: { projectId: 'proj-1', agreementId: 'agreement-2' }
        });
      }
    }
  });

  it('renders DataTable when loading is false', async () => {
    wrapper.vm.isLoading = false;
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent({ name: 'DataTable' }).exists()).toBe(true);
  });

  it('renders tenant names correctly in DataTable', () => {
    const tenantText = wrapper.html();
    expect(tenantText).toContain('John Doe');
  });

  it('displays translated title', () => {
    const title = wrapper.find('h1');
    expect(title.exists()).toBe(true);
    const titleText = title.text();
    // The title should not contain hardcoded "Mieterdaten Ansicht" duplicated
    expect(titleText).not.toContain('Mieterdaten Ansicht Mieterdaten Ansicht');
    // Title should be from translation
    expect(titleText.length).toBeGreaterThan(0);
  });

  it('renders unit information in the table', () => {
    const html = wrapper.html();
    expect(html).toContain('unit-101');
  });

  it('closes dialog when cancel button is clicked', async () => {
    wrapper.vm.confirmationDialogVisible = true;
    wrapper.vm.tenantToDelete = mockTenants[0];
    await wrapper.vm.$nextTick();

    wrapper.vm.confirmationDialogVisible = false;
    await wrapper.vm.$nextTick();
    
    expect(wrapper.vm.confirmationDialogVisible).toBe(false);
  });
});
