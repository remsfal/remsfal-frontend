import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import ProjectTenancies from '../../src/views/ProjectTenancies.vue';
import PrimeVue from 'primevue/config';
import Dialog from 'primevue/dialog';
import i18n from '../../src/i18n/i18n';

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

  it('opens add dialog when button is clicked', async () => {
    // Directly call the openAddDialog method
    await wrapper.vm.openAddDialog();

    // Assert that the dialog is open
    expect(wrapper.vm.dialogVisible).toBe(true);
  });

  it('adds a new tenant', async () => {
    wrapper.vm.currentTenant.firstName = 'John';
    wrapper.vm.currentTenant.lastName = 'Doe';
    wrapper.vm.saveTenant();
    expect(wrapper.vm.tenantData).toContainEqual(
      expect.objectContaining({
        firstName: 'John',
        lastName: 'Doe',
      }),
    );
  });

  it('should delete a tenant correctly', async () => {
    // Arrange: Assume there are tenants in the component's data
    const initialTenants = [
      { id: '1', name: 'Tenant 1' },
      { id: '2', name: 'Tenant 2' },
    ];
    wrapper.vm.tenantData = [...initialTenants]; // Manually set tenant data

    // Act: Call the deleteTenant method to delete tenant with id '1'
    wrapper.vm.deleteTenant('1');

    // Assert: Verify that the tenant with id '1' is removed
    expect(wrapper.vm.tenantData).toEqual([{ id: '2', name: 'Tenant 2' }]);
  });

  it('should show confirmation dialog when a tenant is selected for deletion', async () => {
    // Arrange: Assume we have a tenant to delete
    const tenantToDeleteMock = { id: '1', name: 'Tenant 1' };

    // Act: Call the confirmDelete method to select the tenant
    wrapper.vm.confirmDelete(tenantToDeleteMock);

    // Assert: Verify that the tenant is selected for deletion and the dialog is visible
    expect(wrapper.vm.tenantToDelete).toEqual(tenantToDeleteMock);
    expect(wrapper.vm.confirmationDialogVisible).toBe(true);
  });

  it('should delete the tenant and close the dialog when confirmDeletion is called', async () => {
    // Arrange: Assume the tenant is selected for deletion and the dialog is open
    wrapper.vm.tenantToDelete = { id: '1', name: 'Tenant 1' };
    wrapper.vm.confirmationDialogVisible = true;

    // Act: Call the confirmDeletion method
    wrapper.vm.confirmDeletion();

    // Assert: Verify the tenant is deleted and the dialog is closed
    expect(wrapper.vm.tenantData).not.toContainEqual({ id: '1', name: 'Tenant 1' });
    expect(wrapper.vm.confirmationDialogVisible).toBe(false);
  });

  it('should open the edit dialog with the correct tenant data', async () => {
    // Arrange: Create a tenant object
    const tenantToEdit = { id: '1', firstName: 'John', lastName: 'Doe' };

    // Act: Call the openEditDialog method with the tenant object
    wrapper.vm.openEditDialog(tenantToEdit);

    // Assert: Verify that the tenant data is correctly assigned
    expect(wrapper.vm.isEditMode).toBe(true);
    expect(wrapper.vm.currentTenant).toEqual(expect.objectContaining(tenantToEdit));
    expect(wrapper.vm.dialogVisible).toBe(true);
  });
});
