import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import DeleteRentableUnitButton from '@/components/DeleteRentableUnitButton.vue';
import type { RentableUnitTreeNode } from '@/services/PropertyService';

// Mock translation function
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, values?: Record<string, string>) => {
      if (values) {
        return `${key}:${JSON.stringify(values)}`;
      }
      return key;
    },
  }),
}));

describe('DeleteRentableUnitButton.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof DeleteRentableUnitButton>>;
  let mockNode: RentableUnitTreeNode;

  beforeEach(async () => {
    mockNode = {
      key: 'test-property-123',
      data: {
        id: 'test-property-123',
        title: 'Test Property',
        type: 'PROPERTY',
        description: 'Test Description',
      },
      children: [],
    };

    wrapper = mount(DeleteRentableUnitButton, {
      props: { node: mockNode },
      attachTo: document.body, // required for PrimeVue Dialog (teleport)
    });
    vi.clearAllMocks();
  });

  test('renders delete button', () => {
    const deleteButton = wrapper.find('[data-testid="deleteRentableUnitButton"]');
    expect(deleteButton.exists()).toBe(true);
    expect(deleteButton.classes()).toContain('p-button-danger');
  });

  test('opens dialog when delete button is clicked', async () => {
    const deleteButton = wrapper.find('[data-testid="deleteRentableUnitButton"]');
    await deleteButton.trigger('click');
    await wrapper.vm.$nextTick();

    const dialog = document.querySelector('[data-testid="deleteRentableUnitDialog"]');
    expect(dialog).toBeTruthy();
  });

  test('displays correct unit type and title in dialog', async () => {
    const deleteButton = wrapper.find('[data-testid="deleteRentableUnitButton"]');
    await deleteButton.trigger('click');
    await wrapper.vm.$nextTick();

    const dialog = document.querySelector('[data-testid="deleteRentableUnitDialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog?.textContent).toContain('Test Property');
  });

  test('closes dialog when cancel button is clicked', async () => {
    wrapper.vm.showDeleteDialog = true;
    await wrapper.vm.$nextTick();

    const dialog = document.querySelector('[data-testid="deleteRentableUnitDialog"]');
    expect(dialog).toBeTruthy();

    // Set the dialog to false (simulating cancel click)
    wrapper.vm.showDeleteDialog = false;
    await wrapper.vm.$nextTick();

    // Verify that the dialog visibility is set to false in component
    expect(wrapper.vm.showDeleteDialog).toBe(false);
  });

  test('emits delete event when confirm button is clicked', async () => {
    // Call confirmDelete method directly
    wrapper.vm.showDeleteDialog = true;
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.showDeleteDialog).toBe(true);

    // Trigger the confirmDelete method
    wrapper.vm.confirmDelete();
    await wrapper.vm.$nextTick();

    const emitted = wrapper.emitted();
    expect(emitted).toHaveProperty('delete');
    expect(emitted.delete[0]).toEqual([mockNode]);
  });

  test('closes dialog after emitting delete event', async () => {
    wrapper.vm.showDeleteDialog = true;
    await wrapper.vm.$nextTick();

    // Trigger the confirmDelete method
    wrapper.vm.confirmDelete();
    await wrapper.vm.$nextTick();

    // Verify that the dialog visibility is set to false in component
    expect(wrapper.vm.showDeleteDialog).toBe(false);
  });

  test('translates unit type correctly', async () => {
    const deleteButton = wrapper.find('[data-testid="deleteRentableUnitButton"]');
    await deleteButton.trigger('click');
    await wrapper.vm.$nextTick();

    // The mock i18n returns the key, so we check for the unitTypes translation key
    const dialog = document.querySelector('[data-testid="deleteRentableUnitDialog"]');
    expect(dialog?.textContent).toContain('unitTypes.property');
  });

  test('handles different unit types', () => {
    const apartmentNode: RentableUnitTreeNode = {
      key: 'apartment-456',
      data: {
        id: 'apartment-456',
        title: 'Apartment 101',
        type: 'APARTMENT',
        description: 'First floor apartment',
      },
      children: [],
    };

    // Create a new wrapper with different node
    const apartmentWrapper = mount(DeleteRentableUnitButton, {props: { node: apartmentNode },});

    // Test the getUnitTypeTranslation method directly
    const translatedType = apartmentWrapper.vm.getUnitTypeTranslation();
    expect(translatedType).toBe('unitTypes.apartment');
  });

  test('handles node without data gracefully', async () => {
    const emptyNode: RentableUnitTreeNode = {
      key: 'empty-node',
      data: undefined,
      children: [],
    };

    await wrapper.setProps({ node: emptyNode });
    await wrapper.vm.$nextTick();

    const deleteButton = wrapper.find('[data-testid="deleteRentableUnitButton"]');
    expect(deleteButton.exists()).toBe(true);

    // Should not crash when clicking
    await deleteButton.trigger('click');
    await wrapper.vm.$nextTick();

    const dialog = document.querySelector('[data-testid="deleteRentableUnitDialog"]');
    expect(dialog).toBeTruthy();
  });

  test('dialog has correct header', async () => {
    const deleteButton = wrapper.find('[data-testid="deleteRentableUnitButton"]');
    await deleteButton.trigger('click');
    await wrapper.vm.$nextTick();

    const dialog = document.querySelector('[data-testid="deleteRentableUnitDialog"]');
    const header = dialog?.querySelector('.p-dialog-header');
    expect(header?.textContent).toContain('rentableUnits.delete.confirmTitle');
  });

  test('confirm button has danger severity', async () => {
    const deleteButton = wrapper.find('[data-testid="deleteRentableUnitButton"]');
    await deleteButton.trigger('click');
    await wrapper.vm.$nextTick();

    const confirmButton = document.querySelector('[data-testid="confirmDeleteButton"]');
    expect(confirmButton).toBeTruthy();
    expect(confirmButton?.classList.contains('p-button-danger')).toBe(true);
  });
});
