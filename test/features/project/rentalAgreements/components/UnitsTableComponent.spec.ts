import UnitsTableComponent from '@/features/project/rentalAgreements/components/UnitsTableComponent.vue';
import { propertyService, type PropertyListJson } from '@/services/PropertyService';
import type { components } from '@/services/api/platform-schema';
import { mount, flushPromises } from '@vue/test-utils';
import Select from 'primevue/select';
import {beforeEach, describe, expect, it, vi} from 'vitest';

type RentalUnitJson = components['schemas']['RentalUnitJson'];

vi.mock('@/services/PropertyService', () => ({
  propertyService: {getPropertyTree: vi.fn(),},
  EntityType: {
    Property: 'Property',
    Building: 'Building',
  },
}));

vi.mock('@/stores/ProjectStore', () => ({useProjectStore: () => ({projectId: 'mock-project-id',}),}));

describe('UnitsTableComponent - loadDropdownOptions', () => {
  // At least one row is required so a cell exists to click into edit mode - the `Select`
  // editor (fed by rentalObjects/unitTypes) only renders inside a DataTable cell's #editor
  // slot, which only mounts once that cell is being edited.
  const existingUnit: RentalUnitJson = {
    id: 'unit-1', type: 'PROPERTY', title: 'Existing Unit' 
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load and set rentalObjects and unitTypes correctly', async () => {
    const mockTree: PropertyListJson = {
      properties: [
        {
          key: '1',
          data: { title: 'Unit A', type: 'BUILDING' },
          children: [
            {
              key: '1-1',
              data: { title: 'Unit B', type: 'APARTMENT' },
              children: [],
            },
          ],
        },
      ],
    };

    vi.mocked(propertyService.getPropertyTree).mockResolvedValueOnce(mockTree);

    const wrapper = mount(UnitsTableComponent, {props: { listOfUnits: [existingUnit], isDeleteButtonEnabled: false },});

    // Wait for onMounted and loadDropdownOptions to finish
    await flushPromises();

    expect(propertyService.getPropertyTree).toHaveBeenCalledWith('mock-project-id');

    const expectedUnitTypes = [
      { label: 'Unit A', value: 'Unit A' },
      { label: 'Unit B', value: 'Unit B' },
    ];

    // Enter cell-edit mode on the row's "type" and "title" columns to render their Select
    // editors. Both columns resolve their editor options via
    // `field === 'rentalObject' ? rentalObjects : unitTypes` in UnitsTableComponent.vue -
    // since neither column's field is actually named 'rentalObject', both editors always
    // receive `unitTypes`. This reflects the component's current (untouched) behavior.
    const cells = wrapper.findAll('tbody tr')[0].findAll('td');

    await cells[0].trigger('click');
    expect(cells[0].findComponent(Select).props('options')).toEqual(expectedUnitTypes);

    await cells[1].trigger('click');
    expect(cells[1].findComponent(Select).props('options')).toEqual(expectedUnitTypes);
  });

  it('handles fetch error gracefully', async () => {
    vi.mocked(propertyService.getPropertyTree).mockRejectedValueOnce(new Error('fetch failed'));

    const wrapper = mount(UnitsTableComponent, {props: { listOfUnits: [existingUnit], isDeleteButtonEnabled: false },});

    await flushPromises(); // wait for onMounted + promise

    const cells = wrapper.findAll('tbody tr')[0].findAll('td');

    await cells[0].trigger('click');
    expect(cells[0].findComponent(Select).props('options')).toEqual([]);

    await cells[1].trigger('click');
    expect(cells[1].findComponent(Select).props('options')).toEqual([]);
  });
});
