/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import UnitBreadcrumb from '@/components/UnitBreadcrumb.vue';
import { propertyService } from '@/services/PropertyService';

// Mocks
vi.mock('../../src/services/PropertyService', () => ({
  propertyService: {
    getBreadcrumbPath: vi.fn(),
    getProperty: vi.fn(),
  },
}));

const mockPush = vi.fn();
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mockPush }) }));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }));

const BreadcrumbStub = {
  name: 'BreadcrumbStub',
  props: ['model'],
  template: '<div class="p-breadcrumb-stub"></div>',
};

const mockPropNode = {
  title: 'Property A',
  id: 'prop-1',
  type: 'PROPERTY',
};

const mockUnitNode = {
  title: 'My Unit',
  id: 'unit-1',
  type: 'APARTMENT',
};

const pathPropOnly = [mockPropNode];
const pathFull = [mockPropNode, mockUnitNode];

describe('UnitBreadcrumb.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  const defaultProps = {
    projectId: 'proj-1',
    unitId: 'unit-1',
    mode: 'edit' as const,
    currentTitle: 'My Unit',
  };

  it('renders correctly in Edit mode (Happy Path)', async () => {
    vi.mocked(propertyService.getBreadcrumbPath).mockResolvedValue(pathFull);

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
    expect(model[2].disabled).toBe(true);
  });

  it('renders correctly in Create mode', async () => {
    const createProps = {
      projectId: 'proj-1',
      parentId: 'prop-1',
      mode: 'create' as const,
    };

    vi.mocked(propertyService.getBreadcrumbPath).mockResolvedValue(pathPropOnly);

    const wrapper = mount(UnitBreadcrumb, {
      props: createProps,
      global: { stubs: { Breadcrumb: BreadcrumbStub } },
    });

    await flushPromises();

    const breadcrumb = wrapper.findComponent(BreadcrumbStub);
    const model = breadcrumb.props('model');

    expect(model).toHaveLength(3);
    expect(model[0].label).toBe('breadcrumb.overview');
    expect(model[1].label).toBe('Property A');
    expect(model[2].label).toBe('breadcrumb.create');
  });

  it('handles contextParentId correctly (SiteView scenario)', async () => {
    const siteProps = {
      projectId: 'proj-1',
      unitId: 'site-1',
      contextParentId: 'prop-1',
      currentTitle: 'My Site',
      mode: 'edit' as const,
    };

    vi.mocked(propertyService.getBreadcrumbPath).mockImplementation((pid: string, uid: string) => {
      if (uid === 'site-1') return Promise.resolve([]);
      if (uid === 'prop-1') return Promise.resolve(pathPropOnly);
      return Promise.resolve([]);
    });

    const wrapper = mount(UnitBreadcrumb, {
      props: siteProps,
      global: { stubs: { Breadcrumb: BreadcrumbStub } },
    });

    await flushPromises();

    const breadcrumb = wrapper.findComponent(BreadcrumbStub);
    const model = breadcrumb.props('model');

    expect(model).toHaveLength(3);
    expect(model[0].label).toBe('breadcrumb.overview');
    expect(model[1].label).toBe('Property A');
    expect(model[2].label).toBe('My Site');
  });

  it('shows fallback (current title) when backend fails', async () => {
    vi.mocked(propertyService.getBreadcrumbPath).mockRejectedValue(new Error('Backend down'));

    const wrapper = mount(UnitBreadcrumb, {
      props: defaultProps,
      global: { stubs: { Breadcrumb: BreadcrumbStub } },
    });

    await flushPromises();

    const breadcrumb = wrapper.findComponent(BreadcrumbStub);
    const model = breadcrumb.props('model');

    expect(model).toHaveLength(2);
    expect(model[0].label).toBe('breadcrumb.overview');
    expect(model[1].label).toBe('My Unit');
  });

  it('shows overview link when no other info is available', async () => {
    vi.mocked(propertyService.getBreadcrumbPath).mockRejectedValue(new Error('Backend down'));

    const wrapper = mount(UnitBreadcrumb, {
      props: {
        projectId: 'p1',
        mode: 'edit',
      },
      global: { stubs: { Breadcrumb: BreadcrumbStub } },
    });

    await flushPromises();

    const breadcrumb = wrapper.findComponent(BreadcrumbStub);
    const model = breadcrumb.props('model');

    expect(model).toHaveLength(1);
    expect(model[0].label).toBe('breadcrumb.overview');
  });

  it('uses direct getProperty fallback if tree path fails', async () => {
    const siteProps = {
      projectId: 'proj-1',
      unitId: 'site-1',
      contextParentId: 'prop-1',
      mode: 'edit' as const,
      currentTitle: 'Außenanlage',
    };

    vi.mocked(propertyService.getBreadcrumbPath).mockRejectedValue(new Error('Tree Error'));
    vi.mocked(propertyService.getProperty).mockResolvedValue({ title: 'Direct Property' });

    const wrapper = mount(UnitBreadcrumb, {
      props: siteProps,
      global: { stubs: { Breadcrumb: BreadcrumbStub } },
    });

    await flushPromises();

    const breadcrumb = wrapper.findComponent(BreadcrumbStub);
    const model = breadcrumb.props('model');

    expect(model).toHaveLength(3);
    expect(model[0].label).toBe('breadcrumb.overview');
    expect(model[1].label).toBe('Direct Property');
    expect(model[2].label).toBe('Außenanlage');
  });

  it('returns early if context parent is already in the path', async () => {
    vi.mocked(propertyService.getBreadcrumbPath).mockResolvedValue(pathFull as any);

    const wrapper = mount(UnitBreadcrumb, {
      props: {
        projectId: 'proj-1',
        unitId: 'unit-1',
        contextParentId: 'prop-1',
        mode: 'edit',
      },
      global: { stubs: { Breadcrumb: BreadcrumbStub } },
    });

    await flushPromises();
    const model = wrapper.findComponent(BreadcrumbStub).props('model');
    expect(model).toHaveLength(3);
  });

  it('ignores context parent errors silently (Code Coverage)', async () => {
    vi.mocked(propertyService.getBreadcrumbPath).mockImplementation((pid, uid) => {
      if (uid === 'unit-1') return Promise.resolve([mockUnitNode as any]);
      return Promise.reject(new Error('Path Error'));
    });
    vi.mocked(propertyService.getProperty).mockRejectedValue(new Error('Direct Error'));

    const wrapper = mount(UnitBreadcrumb, {
      props: {
        projectId: 'proj-1',
        unitId: 'unit-1',
        contextParentId: 'prop-99',
        mode: 'edit',
      },
      global: { stubs: { Breadcrumb: BreadcrumbStub } },
    });

    await flushPromises();
    const model = wrapper.findComponent(BreadcrumbStub).props('model');
    expect(model).toHaveLength(2);
    expect(model[0].label).toBe('breadcrumb.overview');
    expect(model[1].label).toBe('My Unit');
  });

  it('uses default icon for unknown types', async () => {
    vi.mocked(propertyService.getBreadcrumbPath).mockResolvedValue([
      {
        title: 'Unknown',
        id: 'u-1',
        type: 'ALIEN' as any,
      },
    ]);

    const wrapper = mount(UnitBreadcrumb, {
      props: { projectId: 'p1', unitId: 'u-1' },
      global: { stubs: { Breadcrumb: BreadcrumbStub } },
    });

    await flushPromises();
    const model = wrapper.findComponent(BreadcrumbStub).props('model');
    expect(model[1].icon).toBe('pi pi-folder');
  });
});