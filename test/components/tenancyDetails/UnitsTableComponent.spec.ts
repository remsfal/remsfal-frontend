import UnitsTableComponent from '@/components/tenancyDetails/UnitsTableComponent.vue';
import { propertyService } from '@/services/PropertyService';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/PropertyService', () => ({
  propertyService: {
    getPropertyTree: vi.fn(),
  },
  EntityType: {
    Property: 'Property',
    Building: 'Building',
  },
}));

vi.mock('@/stores/ProjectStore', () => ({
  useProjectStore: () => ({
    projectId: 'mock-project-id',
  }),
}));

describe('UnitsTableComponent - loadDropdownOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load and set rentalObjects and unitTypes correctly', async () => {
    const mockTree = {
      properties: [
        {
          key: '1',
          data: { title: 'Unit A', type: 'Building' },
          children: [
            {
              key: '1-1',
              data: { title: 'Unit B', type: 'Apartment' },
              children: [],
            },
          ],
        },
      ],
    };

    (propertyService.getPropertyTree as any).mockResolvedValueOnce(mockTree);

    const wrapper = mount(UnitsTableComponent, {
      props: {
        listOfUnits: [],
      },
    });

    // Wait for onMounted and loadDropdownOptions to finish
    await new Promise(setImmediate);

    const vm: any = wrapper.vm;

    expect(propertyService.getPropertyTree).toHaveBeenCalledWith('mock-project-id');
    expect(vm.rentalObjects).toEqual([
      { label: 'Property', value: 'Property' },
      { label: 'Building', value: 'Building' },
    ]);
    expect(vm.unitTypes).toEqual([
      { label: 'Unit A', value: 'Unit A' },
      { label: 'Unit B', value: 'Unit B' },
    ]);
  });

  it('handles fetch error gracefully', async () => {
    (propertyService.getPropertyTree as any).mockRejectedValueOnce(new Error('fetch failed'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mount(UnitsTableComponent, {
      props: {
        listOfUnits: [],
      },
    });

    await new Promise(setImmediate);

    expect(consoleSpy).toHaveBeenCalledWith('Failed to load dropdown options:', expect.any(Error));
    consoleSpy.mockRestore();
  });
});
