import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Component from '../../src/views/ModifyPropertyView.vue';
import { propertyService } from '../../src/services/PropertyService';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/services/PropertyService', () => ({
  propertyService: {
    getProperty: vi.fn(),
    updateProperty: vi.fn(),
  },
}));

describe('ModifyPropertyView.vue', () => {
  let wrapper;

  beforeEach(async () => {
    (propertyService.getProperty as any).mockResolvedValue({
      title: 'Initial Property Title',
      description: 'Initial Property Description',
      district: 'Initial District',
      corridor: 'Initial Corridor',
      parcel: 'Initial Parcel',
      landRegistry: 'Initial LandRegistry',
      usageType: null,
    });

    wrapper = mount(Component, {
      props: {
        projectId: 'project1',
        unitId: 'unit1',
      },
    });

    await flushPromises(); // wartet auf alle async-Aufrufe
  });

  it('loads property details on mount', () => {
    expect(wrapper.vm.title).toBe('Initial Property Title');
    expect(wrapper.vm.description).toBe('Initial Property Description');
    expect(wrapper.vm.district).toBe('Initial District');
    expect(wrapper.vm.corridor).toBe('Initial Corridor');
    expect(wrapper.vm.parcel).toBe('Initial Parcel');
    expect(wrapper.vm.landRegistry).toBe('Initial LandRegistry');
    expect(wrapper.vm.usageType).toBe(null);
  });

  it('enables save button only if data is modified', async () => {
    const saveButton = wrapper.find('button[type="submit"]');
    expect(saveButton.element.disabled).toBe(true);
    await wrapper.find('input[type="text"]').setValue('New Title');
    expect(wrapper.vm.hasChanges).toBe(true);
    expect(saveButton.attributes('disabled')).toBeUndefined();
  });

  it('calls updateProperty service with correct data when saved', async () => {
    (propertyService.updateProperty as any).mockResolvedValue({});

    // Werte ändern
    await wrapper.find('input[type="text"]').setValue('New Title');
    await wrapper.find('textarea').setValue('New Description');

    await wrapper.find('form').trigger('submit.prevent');

    expect(propertyService.updateProperty).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({
        title: 'New Title',
        description: 'New Description',
        district: 'Initial District',
        corridor: 'Initial Corridor',
        parcel: 'Initial Parcel',
        landRegistry: 'Initial LandRegistry',
        usageType: null,
      }),
    );
  });

  it(' validates plotArea is positive', async () => {
    wrapper.vm.plotArea = -100;
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.validationErrors).toContain('Grundstücksfläche darf nicht negativ sein.');
    expect(wrapper.vm.isValid).toBe(false);
  });
});
