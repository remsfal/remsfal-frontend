import { mount, VueWrapper } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import Dialog from 'primevue/dialog';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../src/i18n/i18n';
import ProjectTenancies from '../../src/views/ProjectTenancies.vue';

// Fix for "window is not defined" error in test environment
if (typeof window === 'undefined') {
  (global as any).window = {};
}

const routerPushMock = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: routerPushMock,
  }),
}));

// Mock PrimeVue configuration and Dialog component to avoid errors during testing
vi.mock('primevue/config', () => ({
  default: {
    install: () => {},
    locale: 'en',
  },
}));

vi.mock('primevue/dialog', () => ({
  default: {
    inheritAttrs: false, // Prevents the passing of extraneous attributes to the root element
    render: () => '<div class="mock-dialog"></div>', // Mock rendering
  },
}));

describe('ProjectTenancies.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    // Mount the component with PrimeVue plugin and Dialog component mocked
    wrapper = mount(ProjectTenancies, {
      global: {
        plugins: [PrimeVue, i18n],
        components: {
          Dialog,
        },
      },
    });
  });

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('shows loading indicator when isLoading is true', async () => {
    wrapper = mount(ProjectTenancies, {
      global: {
        plugins: [PrimeVue, i18n],
        stubs: ['DataTable', 'Column', 'Button'], // stub heavy components
      },
      data() {
        return {
          isLoading: true,
        };
      },
    });

    expect(wrapper.text()).toContain('Loading...');
  });

  it('opens and closes the confirmation dialog', async () => {
    wrapper.vm.confirmationDialogVisible = true;
    wrapper.vm.tenantToDelete = { id: '1', firstName: 'Test', lastName: 'User' };

    expect(wrapper.vm.confirmationDialogVisible).toBe(true);
    expect(wrapper.vm.tenantToDelete?.firstName).toBe('Test');

    // Call confirmDeletion (should delete and close dialog)
    wrapper.vm.confirmDeletion();
    expect(wrapper.vm.confirmationDialogVisible).toBe(false);
  });

  it('removes the tenant from tenantData', () => {
    const tenant = { id: '1', firstName: 'Test', lastName: 'User' };
    wrapper.vm.tenantData = [tenant];
    wrapper.vm.deleteTenant('1');
    expect(wrapper.vm.tenantData).toEqual([]);
  });

  it('does nothing if tenantToDelete is null', () => {
    wrapper.vm.tenantData = [{ id: '1', firstName: 'Test', lastName: 'User' }];
    wrapper.vm.tenantToDelete = null;
    wrapper.vm.confirmDeletion();

    // Should not change tenantData
    expect(wrapper.vm.tenantData.length).toBe(1);
  });

  it('navigates to tenancy details on row click', () => {
    wrapper.vm.navigateToTenancyDetails('abc');
    expect(routerPushMock).toHaveBeenCalledWith(
      '/project/' + wrapper.vm.projectStore.projectId + '/tenancies/abc',
    );
  });

  it('renders loading indicator when isLoading is true', () => {
    wrapper.vm.isLoading = true;
    wrapper.vm.$forceUpdate(); // Trigger re-render
    expect(wrapper.html()).toContain('Loading...');
  });

  it('renders DataTable when loading is false', async () => {
    wrapper.vm.isLoading = false;
    wrapper.vm.tenancyData = [
      {
        id: '1',
        rentalStart: '2023-01-01',
        rentalEnd: '2024-01-01',
        listOfTenants: [],
        listOfUnits: [],
      },
    ];
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent({ name: 'DataTable' }).exists()).toBe(true);
  });
});
