import {mount, VueWrapper, flushPromises} from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import Dialog from 'primevue/dialog';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import i18n from '../../src/i18n/i18n';
import ProjectTenancies from '../../src/views/ProjectTenancies.vue';
import { tenancyService } from '../../src/services/TenancyService';

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

describe('ProjectTenancies.vue', () => {
  let wrapper: VueWrapper<any>;

  const mockTenants = [
    {
 id: '1', firstName: 'John', lastName: 'Doe' 
},
  ];
  const mockTenancies = [
    {
 id: 't1', rentalStart: '2023-01-01', rentalEnd: '2024-01-01', listOfTenants: mockTenants, listOfUnits: [] 
},
  ];

  beforeEach(async () => {
    vi.spyOn(tenancyService, 'fetchTenantData').mockResolvedValue(mockTenants);
    vi.spyOn(tenancyService, 'fetchTenancyData').mockResolvedValue(mockTenancies);

    wrapper = mount(ProjectTenancies, {
      props: {projectId: 'proj-1',},
      global: {
        plugins: [PrimeVue, i18n],
        components: { Dialog },
      },
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

  it('navigates to tenancy details on row click', () => {
    wrapper.vm.navigateToTenancyDetails('t1');
    expect(routerPushMock).toHaveBeenCalledWith('/project/proj-1/tenancies/t1');
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

  it('displays translated title with project ID', () => {
    const title = wrapper.find('h1');
    expect(title.exists()).toBe(true);
    // The title should contain the translation key content, not hardcoded "Mieterdaten Ansicht"
    const titleText = title.text();
    expect(titleText).toContain('proj-1');
    // Make sure it's using the translation and not hardcoded German
    expect(titleText).not.toContain('Mieterdaten Ansicht Mieterdaten Ansicht');
  });
});
