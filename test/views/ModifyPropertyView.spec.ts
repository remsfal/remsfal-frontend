import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Component from '../../src/views/ModifyPropertyView.vue';
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

describe('ModifyPropertyView.vue', () => {
  let wrapper;

  beforeEach(async () => {
    (propertyService.getProperty as any).mockResolvedValue({
      title: 'Initial Property Title',
      description: 'Initial Property Description',
      district: 'Initial District',
      corridor: 'Initial Corridor',
      parcel: 'Initial Parcel',
      landRegisterEntry: 'Initial LandRegistry',
      usageType: 'GF Wohnen',
      plotArea: 100,
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
    expect(wrapper.vm.landRegisterEntry).toBe('Initial LandRegistry');
    expect(wrapper.vm.usageType).toBe('GF Wohnen');
    expect(wrapper.vm.plotArea).toBe(100);
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
    wrapper.vm.title = 'New Title';
    await wrapper.vm.save();

    expect(propertyService.updateProperty).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({
        title: 'New Title',
        description: 'Initial Property Description',
        district: 'Initial District',
        corridor: 'Initial Corridor',
        parcel: 'Initial Parcel',
        landRegisterEntry: 'Initial LandRegistry',
        usageType: 'GF Wohnen',
        plotArea: 100,
      }),
    );
  });

  it(' validates plotArea is positive', async () => {
    wrapper.vm.plotArea = -100;
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.validationErrors).toContain('Grundstücksfläche darf nicht negativ sein.');
    expect(wrapper.vm.isValid).toBe(false);
  });

  it('validates that cancel button redirects to property list with correct route', async () => {
    mockPush.mockClear(); // Reset vor jedem Test
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    wrapper = mount(Component, {
      props: {
        projectId: 'project1',
        unitId: 'unit1',
      },
    });

    await flushPromises();
    await wrapper.find('input[type="text"]').setValue('Geänderter Titel');
    const cancelBtn = wrapper.find('button[type="button"]');
    await cancelBtn.trigger('click');

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/project/project1/objects');

    confirmSpy.mockRestore();
  });
});
