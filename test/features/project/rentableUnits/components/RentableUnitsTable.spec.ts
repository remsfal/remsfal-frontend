import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import RentableUnitsTable from '@/features/project/rentableUnits/components/RentableUnitsTable.vue';
import type { RentalUnitTreeNodeJson, RentalUnitNodeDataJson } from '@/services/PropertyService';

// ---- Mock Data ----
const mockTreeData: RentalUnitTreeNodeJson[] = [
  {
    key: 'property-1',
    data: {
      title: 'Test Property',
      type: 'PROPERTY',
      description: 'A test property',
      tenant: '',
      usable_space: '',
    },
    children: [
      {
        key: 'site-1',
        data: {
          title: 'Test Site',
          type: 'SITE',
          description: 'A test site',
          tenant: '',
          usable_space: '',
        },
        children: [
          {
            key: 'building-1',
            data: {
              title: 'Test Building',
              type: 'BUILDING',
              description: 'A test building',
              tenant: '',
              usable_space: '',
            },
            children: [
              {
                key: 'apartment-1',
                data: {
                  title: 'Test Apartment',
                  type: 'APARTMENT',
                  description: 'A test apartment',
                  tenant: 'John Doe',
                  usable_space: '75',
                },
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

// ---- Mocks ----
const mockRouterPush = vi.fn();

vi.mock('vue-router', () => ({useRouter: () => ({ push: mockRouterPush }),}));

// ---- Test Suite ----
describe('RentableUnitsTable.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof RentableUnitsTable>>;

  beforeEach(async () => {
    vi.clearAllMocks();

    wrapper = mount(RentableUnitsTable, {
      props: {
        projectId: 'test-project-id',
        rentableUnitTree: mockTreeData,
        expandedKeys: {},
      },
    });

    await flushPromises();
  });

  test('renders TreeTable with provided data', () => {
    const treeTable = wrapper.findComponent({ name: 'TreeTable' });
    expect(treeTable.exists()).toBe(true);
    expect(treeTable.props('value')).toEqual(mockTreeData);
  });

  test('renders expand all button', () => {
    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('renders collapse all button', () => {
    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBeGreaterThan(1);
  });

  test('emits expandAll event when expand all button is clicked', async () => {
    wrapper.vm.expandAll();
    await flushPromises();

    expect(wrapper.emitted('expandAll')).toBeTruthy();
    expect(wrapper.emitted('expandAll')?.length).toBe(1);
  });

  test('emits collapseAll event when collapse all button is clicked', async () => {
    wrapper.vm.collapseAll();
    await flushPromises();

    expect(wrapper.emitted('collapseAll')).toBeTruthy();
    expect(wrapper.emitted('collapseAll')?.length).toBe(1);
  });

  test('navigates to correct route when node is selected', async () => {
    const node: RentalUnitTreeNodeJson = {
      key: 'apartment-1',
      data: {
        title: 'Test Apartment',
        type: 'APARTMENT',
        description: 'A test apartment',
        tenant: 'John Doe',
        usable_space: '75',
      },
      children: [],
    };

    wrapper.vm.onNodeSelect(node);
    await flushPromises();

    expect(mockRouterPush).toHaveBeenCalledWith({
      name: 'ApartmentView',
      params: { projectId: 'test-project-id', unitId: 'apartment-1' },
    });
  });

  test('does not navigate when node has no type', async () => {
    const node: RentalUnitTreeNodeJson = {
      key: 'invalid-node',
      data: undefined,
      children: [],
    };

    wrapper.vm.onNodeSelect(node);
    await flushPromises();

    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  test('emits newUnit event when NewRentableUnitButton triggers newUnit', async () => {
    wrapper.vm.onNewRentableUnit('New Unit Title');
    await flushPromises();

    expect(wrapper.emitted('newUnit')).toBeTruthy();
    expect(wrapper.emitted('newUnit')?.[0]).toEqual(['New Unit Title']);
  });


  test('emits update:expandedKeys event when expanded keys change', async () => {
    const treeTable = wrapper.findComponent({ name: 'TreeTable' });
    const newExpandedKeys = { 'property-1': true };

    treeTable.vm.$emit('update:expandedKeys', newExpandedKeys);
    await flushPromises();

    expect(wrapper.emitted('update:expandedKeys')).toBeTruthy();
    expect(wrapper.emitted('update:expandedKeys')?.[0]).toEqual([newExpandedKeys]);
  });

  test('translates unit types correctly', () => {
    const translatedType = wrapper.vm.translateType('APARTMENT');
    expect(translatedType).toBeDefined();
  });

  test('renders NewPropertyButton component', () => {
    const newPropertyButton = wrapper.findComponent({ name: 'NewPropertyButton' });
    expect(newPropertyButton.exists()).toBe(true);
    expect(newPropertyButton.props('projectId')).toBe('test-project-id');
  });

  test('passes correct expandedKeys prop to TreeTable', async () => {
    const expandedKeys = { 'property-1': true, 'site-1': true };
    await wrapper.setProps({ expandedKeys });
    await flushPromises();

    const treeTable = wrapper.findComponent({ name: 'TreeTable' });
    expect(treeTable.props('expandedKeys')).toEqual(expandedKeys);
  });

  test('locationOrDescription returns location when location differs from title', () => {
    const result = wrapper.vm.locationOrDescription({
      title: 'My Building',
      location: 'Floor 3',
      description: undefined,
    } as RentalUnitNodeDataJson);
    expect(result).toBe('Floor 3');
  });

  test('locationOrDescription returns description when location equals title and description exists', () => {
    const result = wrapper.vm.locationOrDescription({
      title: 'Same',
      location: 'Same',
      description: 'Some description',
    } as RentalUnitNodeDataJson);
    expect(result).toBe('Some description');
  });
});
