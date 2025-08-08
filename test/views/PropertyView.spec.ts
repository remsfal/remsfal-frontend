import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Component from '../../src/views/PropertyView.vue';
import { propertyService } from '../../src/services/PropertyService';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('../../src/services/PropertyService', () => ({
  propertyService: {
    getProperty: vi.fn(),
    updateProperty: vi.fn(),
  },
}));

describe('PropertyView.vue', () => {
  let wrapper;

  beforeEach(async () => {
    (propertyService.getProperty as any).mockResolvedValue({
      title: 'Initial Property Title',
      description: 'Initial Property Description',
      cadastralDistrict: 'Initial District',     // updated key
      corridor: 'Initial Corridor',
      parcel: 'Initial Parcel',
      landRegistry: 'Initial LandRegistry',       // updated key
      usageType: 'GF Wohnen',
      effectiveSpace: 100,                         // updated key
    });

    wrapper = mount(Component, {
      props: {
        projectId: 'project1',
        unitId: 'unit1',
      },
    });

    await flushPromises();
  });

  it('loads property details on mount', () => {
    expect(wrapper.vm.title).toBe('Initial Property Title');
    expect(wrapper.vm.description).toBe('Initial Property Description');
    expect(wrapper.vm.district).toBe('Initial District');           // should match component's data property name
    expect(wrapper.vm.corridor).toBe('Initial Corridor');
    expect(wrapper.vm.parcel).toBe('Initial Parcel');
    expect(wrapper.vm.landRegisterEntry).toBe('Initial LandRegistry'); // check if your component uses 'landRegisterEntry' or 'landRegistry' and be consistent
    expect(wrapper.vm.usageType).toBe('GF Wohnen');
    expect(wrapper.vm.plotArea).toBe(100);                           // if your component uses 'plotArea' or 'effectiveSpace' property name for the UI, keep consistent
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

    wrapper.vm.title = 'New Title';
    await wrapper.vm.save();

    expect(propertyService.updateProperty).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({
        title: 'New Title',
        description: 'Initial Property Description',
        cadastralDistrict: 'Initial District',
        corridor: 'Initial Corridor',
        parcel: 'Initial Parcel',
        landRegistry: 'Initial LandRegistry',
        usageType: 'GF Wohnen',
        effectiveSpace: 100,
      }),
    );
  });

  it('validates plotArea is positive', async () => {
    wrapper.vm.plotArea = -100;
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.validationErrors).toContain('Grundstücksfläche darf nicht negativ sein.');
    expect(wrapper.vm.isValid).toBe(false);
  });
});
