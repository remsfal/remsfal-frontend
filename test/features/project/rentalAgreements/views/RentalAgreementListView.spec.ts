import {mount, VueWrapper, flushPromises} from '@vue/test-utils';
import Dialog from 'primevue/dialog';
import DataTable from 'primevue/datatable';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import RentalAgreementView from '@/features/project/rentalAgreements/views/RentalAgreementListView.vue';
import { rentalAgreementService, type RentalAgreementJson } from '@/services/RentalAgreementService';

// Fix for "window is not defined" error
if (typeof window === 'undefined') (global as Record<string, unknown>).window = {};

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
  let wrapper: VueWrapper<InstanceType<typeof RentalAgreementView>>;

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
    let resolveFetch!: (value: RentalAgreementJson[]) => void;
    vi.spyOn(rentalAgreementService, 'fetchRentalAgreements').mockImplementationOnce(
      () => new Promise<RentalAgreementJson[]>((resolve) => { resolveFetch = resolve; }),
    );

    const loadingWrapper = mount(RentalAgreementView, {
      props: {projectId: 'proj-1',},
      global: {components: { Dialog },},
    });

    // Assert the loading text is shown synchronously, before the fetch resolves.
    expect(loadingWrapper.text()).toContain(loadingWrapper.vm.$t('projectTenancies.loading'));

    resolveFetch(mockRentalAgreements);
    await flushPromises();
  });

  it('renders DataTable when loading is false', async () => {
    let resolveFetch!: (value: RentalAgreementJson[]) => void;
    vi.spyOn(rentalAgreementService, 'fetchRentalAgreements').mockImplementationOnce(
      () => new Promise<RentalAgreementJson[]>((resolve) => { resolveFetch = resolve; }),
    );

    const loadingWrapper = mount(RentalAgreementView, {
      props: {projectId: 'proj-1',},
      global: {components: { Dialog },},
    });

    expect(loadingWrapper.findComponent(DataTable).exists()).toBe(false);

    resolveFetch(mockRentalAgreements);
    await flushPromises();

    expect(loadingWrapper.findComponent(DataTable).exists()).toBe(true);
  });

  it('navigates to rental agreement details on row click', async () => {
    const dataTable = wrapper.findComponent(DataTable);
    expect(dataTable.exists()).toBe(true);

    await dataTable.vm.$emit('rowClick', { data: { id: 'agreement-2' } });

    expect(routerPushMock).toHaveBeenCalledWith({
      name: 'RentalAgreementDetails',
      params: { projectId: 'proj-1', agreementId: 'agreement-2' }
    });
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
});
