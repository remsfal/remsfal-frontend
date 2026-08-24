import { mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RentableUnitsCard from '@/features/project/rentableUnits/components/RentableUnitsCard.vue';
import type { RentalUnitTreeNodeJson } from '@/features/project/rentableUnits/services/PropertyService';
import { useRentableUnitsStore } from '@/features/project/rentableUnits/stores/RentableUnitsStore';

describe('RentableUnitsCard', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    useRentableUnitsStore().$reset();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  it('renders RentableUnitsTable with the tree already loaded in the store', () => {
    const store = useRentableUnitsStore();
    store.rentableUnitTree = [
      {
        key: '1',
        data: {
          type: 'PROPERTY', title: 'Root', space: 100
        },
        children: [],
      },
    ] as RentalUnitTreeNodeJson[];
    store.loadedProjectId = '123';

    wrapper = mount(RentableUnitsCard, {
      props: { projectId: '123' },
      global: { stubs: { teleport: true } },
    });

    expect(wrapper.findComponent({ name: 'RentableUnitsTable' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'TreeTable' }).exists()).toBe(true);
  });

  it('shows skeleton while loading', () => {
    useRentableUnitsStore().isLoading = true;

    wrapper = mount(RentableUnitsCard, {
      props: { projectId: '123' },
      global: { stubs: { teleport: true } },
    });

    expect(wrapper.findComponent({ name: 'Skeleton' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'RentableUnitsTable' }).exists()).toBe(false);
  });

});
