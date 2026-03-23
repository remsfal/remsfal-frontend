import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RentableUnitsCard from '@/features/project/rentableUnits/components/RentableUnitsCard.vue';
import { EntityType, type PropertyList, propertyService } from '@/services/PropertyService';
import { buildingService } from '@/services/BuildingService';

vi.mock('@/services/PropertyService');
vi.mock('@/services/ApartmentService');
vi.mock('@/services/BuildingService');
vi.mock('@/services/CommercialService');
vi.mock('@/services/SiteService');
vi.mock('@/services/StorageService');

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

  it('opens delete confirmation dialog when delete button is clicked', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
      properties: [
        {
          key: '1',
          data: { title: 'Test', type: EntityType.Property },
          children: [],
        },
      ],
      first: 0,
      size: 1,
      total: 1,
    } as PropertyList);

    wrapper = mount(RentableUnitsCard, {
      props: { projectId: '1' },
      attachTo: document.body,
      global: { stubs: { teleport: true } },
    });

    await flushPromises();

    const deleteBtn = wrapper.find('[data-testid="deleteRentableUnitButton"]');
    expect(deleteBtn.exists()).toBe(true);
  });

  it('onDeleteNode calls propertyService.deleteProperty for PROPERTY type', async () => {
    const deleteSpy = vi.mocked(propertyService.deleteProperty).mockResolvedValue(undefined);
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
      properties: [],
      first: 0,
      size: 0,
      total: 0,
    } as PropertyList);

    wrapper = mount(RentableUnitsCard, {
      props: { projectId: 'projId' },
      attachTo: document.body,
      global: { stubs: { teleport: true } },
    });

    await flushPromises();

    const sampleNode = {
      key: 'prop-1',
      data: {
        type: EntityType.Property,
        title: 'Test Property',
        description: '',
        tenant: '',
        usable_space: 0,
      },
      children: [],
    };

    (wrapper.vm as InstanceType<typeof RentableUnitsCard>).onDeleteNode(sampleNode);
    await flushPromises();

    expect(deleteSpy).toHaveBeenCalledWith('projId', 'prop-1');
  });

  it('onDeleteNode calls buildingService.deleteBuilding for BUILDING type', async () => {
    const deleteSpy = vi.mocked(buildingService.deleteBuilding).mockResolvedValue(undefined);
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
      properties: [],
      first: 0,
      size: 0,
      total: 0,
    } as PropertyList);

    wrapper = mount(RentableUnitsCard, {
      props: { projectId: 'projId' },
      attachTo: document.body,
      global: { stubs: { teleport: true } },
    });

    await flushPromises();

    const sampleNode = {
      key: 'building-1',
      data: {
        type: EntityType.Building,
        title: 'Test Building',
        description: '',
        tenant: '',
        usable_space: 0,
      },
      children: [],
    };

    (wrapper.vm as InstanceType<typeof RentableUnitsCard>).onDeleteNode(sampleNode);
    await flushPromises();

    expect(deleteSpy).toHaveBeenCalledWith('projId', 'building-1');
  });
});
