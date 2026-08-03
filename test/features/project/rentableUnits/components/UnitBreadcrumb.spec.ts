import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import UnitBreadcrumb from '@/features/project/rentableUnits/components/UnitBreadcrumb.vue';
import { propertyService, type PropertyListJson } from '@/features/project/rentableUnits/services/PropertyService';

vi.mock('@/features/project/rentableUnits/services/PropertyService', () => ({
  propertyService: {getPropertyTree: vi.fn(),},
  EntityType: { Property: 'PROPERTY' },
  toRentableUnitView: (type: string) => type[0]! + type.slice(1).toLowerCase() + 'View',
  getIconForUnitType: vi.fn(() => 'pi pi-folder'),
}));

const mockPush = vi.fn();
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mockPush }) }));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }));

const BreadcrumbStub = {
  name: 'BreadcrumbStub',
  props: ['model'],
  template: '<div class="p-breadcrumb-stub"></div>',
};

const mockTree: PropertyListJson = {
  properties: [
    {
      key: 'prop-1',
      data: { title: 'Property A', type: 'PROPERTY' },
      children: [
        {
          key: 'unit-1',
          data: { title: 'My Unit', type: 'APARTMENT' },
          children: [],
        },
      ],
    },
  ],
};

const emptyTree: PropertyListJson = { properties: [] };

describe('UnitBreadcrumb.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  const defaultProps = {
    projectId: 'proj-1',
    unitId: 'unit-1',
  };

  it('renders correctly (Happy Path)', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue(mockTree);

    const wrapper = mount(UnitBreadcrumb, {
      props: defaultProps,
      global: { stubs: { Breadcrumb: BreadcrumbStub } },
    });

    await flushPromises();

    const breadcrumb = wrapper.findComponent(BreadcrumbStub);
    expect(breadcrumb.exists()).toBe(true);

    const model = breadcrumb.props('model');
    expect(model).toHaveLength(3);
    expect(model[0].label).toBe('breadcrumb.overview');
    expect(model[0].icon).toBe('pi pi-th-large');
    expect(model[1].label).toBe('Property A');
    expect(model[2].label).toBe('My Unit');
    expect(typeof model[2].command).toBe('function');
  });

  it('shows "Unbenannt" fallback when a node has no title', async () => {
    const treeWithoutTitle = {
      properties: [
        // title intentionally omitted to simulate a backend response violating its own contract
        {
          key: 'prop-1', data: { type: 'PROPERTY' }, children: [] 
        },
      ],
    } as unknown as PropertyListJson;
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue(treeWithoutTitle);

    const wrapper = mount(UnitBreadcrumb, {
      props: { projectId: 'proj-1', unitId: 'prop-1' },
      global: { stubs: { Breadcrumb: BreadcrumbStub } },
    });

    await flushPromises();

    const model = wrapper.findComponent(BreadcrumbStub).props('model');
    expect(model[1].label).toBe('Unbenannt');
  });

  it('defaults node type to Property when a node has no type', async () => {
    const treeWithoutType = {
      properties: [
        // type intentionally omitted to simulate a backend response violating its own contract
        {
          key: 'prop-1', data: { title: 'No Type Node' }, children: [] 
        },
      ],
    } as unknown as PropertyListJson;
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue(treeWithoutType);

    const wrapper = mount(UnitBreadcrumb, {
      props: { projectId: 'proj-1', unitId: 'prop-1' },
      global: { stubs: { Breadcrumb: BreadcrumbStub } },
    });

    await flushPromises();

    const model = wrapper.findComponent(BreadcrumbStub).props('model');
    expect(model[1].icon).toBe('pi pi-map');
  });

  it('does not crash and shows only overview link when backend response has no properties key', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({} as unknown as PropertyListJson);

    const wrapper = mount(UnitBreadcrumb, {
      props: { projectId: 'proj-1', unitId: 'unit-1' },
      global: { stubs: { Breadcrumb: BreadcrumbStub } },
    });

    await flushPromises();

    const model = wrapper.findComponent(BreadcrumbStub).props('model');
    expect(model).toHaveLength(1);
    expect(model[0].label).toBe('breadcrumb.overview');
  });

  it('does not fetch breadcrumb path when projectId is empty', async () => {
    const wrapper = mount(UnitBreadcrumb, {
      props: { projectId: '', unitId: 'unit-1' },
      global: { stubs: { Breadcrumb: BreadcrumbStub } },
    });

    await flushPromises();

    expect(propertyService.getPropertyTree).not.toHaveBeenCalled();
    const model = wrapper.findComponent(BreadcrumbStub).props('model');
    expect(model).toHaveLength(1);
    expect(model[0].label).toBe('breadcrumb.overview');
  });

  it('shows only overview link when backend fails', async () => {
    vi.mocked(propertyService.getPropertyTree).mockRejectedValue(new Error('Backend down'));

    const wrapper = mount(UnitBreadcrumb, {
      props: { projectId: 'p1' },
      global: { stubs: { Breadcrumb: BreadcrumbStub } },
    });

    await flushPromises();

    const model = wrapper.findComponent(BreadcrumbStub).props('model');
    expect(model).toHaveLength(1);
    expect(model[0].label).toBe('breadcrumb.overview');
  });

  it('shows only overview link when unit ID not found in tree', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue(emptyTree);

    const wrapper = mount(UnitBreadcrumb, {
      props: { projectId: 'p1', unitId: 'ghost-id' },
      global: { stubs: { Breadcrumb: BreadcrumbStub } },
    });

    await flushPromises();
    const model = wrapper.findComponent(BreadcrumbStub).props('model');
    expect(model).toHaveLength(1);
    expect(model[0].label).toBe('breadcrumb.overview');
  });

  it('calls router.push when overview item is clicked', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue(mockTree);

    const wrapper = mount(UnitBreadcrumb, {
      props: defaultProps,
      global: { stubs: { Breadcrumb: BreadcrumbStub } },
    });

    await flushPromises();

    const model = wrapper.findComponent(BreadcrumbStub).props('model');
    model[0].command();
    expect(mockPush).toHaveBeenCalledWith({
      name: 'RentableUnits',
      params: { projectId: 'proj-1' },
    });
  });

  it('shows only overview link when backend fails with a unitId', async () => {
    vi.mocked(propertyService.getPropertyTree).mockRejectedValue(new Error('Backend down'));

    const wrapper = mount(UnitBreadcrumb, {
      props: { projectId: 'p1', unitId: 'unit-1' },
      global: { stubs: { Breadcrumb: BreadcrumbStub } },
    });

    await flushPromises();

    const model = wrapper.findComponent(BreadcrumbStub).props('model');
    expect(model).toHaveLength(1);
    expect(model[0].label).toBe('breadcrumb.overview');
  });

  it('calls router.push when a non-last breadcrumb item is clicked', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue(mockTree);

    const wrapper = mount(UnitBreadcrumb, {
      props: defaultProps,
      global: { stubs: { Breadcrumb: BreadcrumbStub } },
    });

    await flushPromises();

    const model = wrapper.findComponent(BreadcrumbStub).props('model');
    // model[1] = Property A (non-last item) — should navigate
    model[1].command();
    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({ params: expect.objectContaining({ unitId: 'prop-1' }) }),
    );
  });

  it('calls preventDefault and does not navigate when last breadcrumb item is clicked', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue(mockTree);

    const wrapper = mount(UnitBreadcrumb, {
      props: defaultProps,
      global: { stubs: { Breadcrumb: BreadcrumbStub } },
    });

    await flushPromises();

    const model = wrapper.findComponent(BreadcrumbStub).props('model');
    const preventDefault = vi.fn();
    // model[2] = My Unit (last item) — should prevent default only
    model[2].command({ originalEvent: { preventDefault } });
    expect(preventDefault).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
