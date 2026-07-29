import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Message from 'primevue/message';
import RentableUnitsKpiCards from '@/features/project/rentableUnits/components/RentableUnitsKpiCards.vue';
import KpiCard from '@/components/common/KpiCard.vue';
import { type PropertyListJson, propertyService } from '@/services/PropertyService';

vi.mock('@/services/PropertyService');

describe('RentableUnitsKpiCards', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders one KpiCard per unit type present in the tree, aggregating count and space', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
      properties: [
        {
          key: 'property-1',
          data: {
            type: 'PROPERTY', title: 'Grundstück 1', space: 500 
          },
          children: [
            {
              key: 'building-1',
              data: {
                type: 'BUILDING', title: 'Gebäude 1', space: 200 
              },
              children: [
                {
                  key: 'apartment-1',
                  data: {
                    type: 'APARTMENT', title: 'Wohnung 1', space: 50 
                  },
                  children: [],
                },
                {
                  key: 'apartment-2',
                  data: {
                    type: 'APARTMENT', title: 'Wohnung 2', space: 70 
                  },
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    } as PropertyListJson);

    wrapper = mount(RentableUnitsKpiCards, { props: { projectId: '123' } });
    await flushPromises();

    const cards = wrapper.findAllComponents(KpiCard);
    expect(cards).toHaveLength(3);

    expect(cards[0]!.props('title')).toBe('Grundstück');
    expect(cards[0]!.props('value')).toBe(1);
    expect(cards[0]!.props('subtext')).toBe('500 m²');

    expect(cards[1]!.props('title')).toBe('Gebäude');
    expect(cards[1]!.props('value')).toBe(1);
    expect(cards[1]!.props('subtext')).toBe('200 m²');

    expect(cards[2]!.props('title')).toBe('Wohnung');
    expect(cards[2]!.props('value')).toBe(2);
    expect(cards[2]!.props('subtext')).toBe('120 m²');

    expect(propertyService.getPropertyTree).toHaveBeenCalledWith('123');
  });

  it('does not render a card for unit types with no units', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
      properties: [
        {
          key: 'property-1',
          data: {
            type: 'PROPERTY', title: 'Grundstück 1', space: 500 
          },
          children: [],
        },
      ],
    } as PropertyListJson);

    wrapper = mount(RentableUnitsKpiCards, { props: { projectId: '123' } });
    await flushPromises();

    const titles = wrapper.findAllComponents(KpiCard).map((card) => card.props('title'));
    expect(titles).toEqual(['Grundstück']);
  });

  it('ignores nodes without data/type and defaults missing space to 0', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
      properties: [
        {
          key: 'property-1',
          data: {
            type: 'PROPERTY', title: 'Grundstück 1', space: 500
          },
          children: [
            // node without a `data` object at all: `type` is undefined, must not be counted
            { key: 'unknown-1', children: [] },
            // node with a type but no `space`: falls back to 0 instead of throwing
            { key: 'building-1', data: { type: 'BUILDING', title: 'Gebäude 1' }, children: [] },
          ],
        },
      ],
    } as PropertyListJson);

    wrapper = mount(RentableUnitsKpiCards, { props: { projectId: '123' } });
    await flushPromises();

    const cards = wrapper.findAllComponents(KpiCard);
    expect(cards).toHaveLength(2);

    expect(cards[1]!.props('title')).toBe('Gebäude');
    expect(cards[1]!.props('value')).toBe(1);
    expect(cards[1]!.props('subtext')).toBe('0 m²');
  });

  it('shows an empty-state message with a link to create rentable units when none exist', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({properties: [],} as unknown as PropertyListJson);

    wrapper = mount(RentableUnitsKpiCards, { props: { projectId: '123' } });
    await flushPromises();

    expect(wrapper.findComponent(KpiCard).exists()).toBe(false);

    const message = wrapper.findComponent(Message);
    expect(message.exists()).toBe(true);
    expect(message.props('severity')).toBe('success');

    const link = wrapper.find('a[href="/projects/123/units"]');
    expect(link.exists()).toBe(true);
  });

  it('shows skeletons while loading', () => {
    vi.mocked(propertyService.getPropertyTree).mockReturnValue(new Promise(() => {}));

    wrapper = mount(RentableUnitsKpiCards, { props: { projectId: '123' } });

    expect(wrapper.findComponent({ name: 'Skeleton' }).exists()).toBe(true);
    expect(wrapper.findComponent(KpiCard).exists()).toBe(false);
  });

  it('shows skeletons and a toast when the fetch fails', async () => {
    vi.mocked(propertyService.getPropertyTree).mockRejectedValueOnce(new Error('Fetch failed'));

    wrapper = mount(RentableUnitsKpiCards, { props: { projectId: '123' } });
    await flushPromises();

    expect(wrapper.findComponent({ name: 'Skeleton' }).exists()).toBe(true);
    expect(wrapper.findComponent(KpiCard).exists()).toBe(false);
  });
});
