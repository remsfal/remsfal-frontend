import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RentableUnitsCard from '@/features/project/rentableUnits/components/RentableUnitsCard.vue';
import { type PropertyList, propertyService } from '@/services/PropertyService';

vi.mock('@/services/PropertyService');

describe('RentableUnitsCard', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders RentableUnitsTable after successful data fetch', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
      properties: [
        {
          key: '1',
          data: {
 type: 'PROPERTY', title: 'Root', usable_space: 100 
},
          children: [],
        },
      ],
      first: 0,
      size: 1,
      total: 1,
    } as PropertyList);

    wrapper = mount(RentableUnitsCard, {
      props: { projectId: '123' },
      global: { stubs: { teleport: true } },
    });

    await flushPromises();

    expect(wrapper.findComponent({ name: 'RentableUnitsTable' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'TreeTable' }).exists()).toBe(true);
    expect(propertyService.getPropertyTree).toHaveBeenCalledWith('123');
  });

  it('shows skeleton while loading', () => {
    vi.mocked(propertyService.getPropertyTree).mockReturnValue(new Promise(() => {}));

    wrapper = mount(RentableUnitsCard, {
      props: { projectId: '123' },
      global: { stubs: { teleport: true } },
    });

    expect(wrapper.findComponent({ name: 'Skeleton' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'RentableUnitsTable' }).exists()).toBe(false);
  });

  it('shows skeleton and toast when fetch fails', async () => {
    vi.mocked(propertyService.getPropertyTree).mockRejectedValueOnce(new Error('Fetch failed'));

    wrapper = mount(RentableUnitsCard, {
      props: { projectId: '123' },
      global: { stubs: { teleport: true } },
    });

    await flushPromises();

    expect(wrapper.findComponent({ name: 'Skeleton' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'RentableUnitsTable' }).exists()).toBe(false);
  });

});
