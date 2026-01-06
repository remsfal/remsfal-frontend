import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import UnitBreadcrumb from '../../src/components/UnitBreadcrumb.vue';
import { propertyService } from '../../src/services/PropertyService';

// Mocks
vi.mock('../../src/services/PropertyService', () => ({
  propertyService: {
    getBreadcrumbPath: vi.fn(),
    getProperty: vi.fn(),
  },
}));

const mockPush = vi.fn();
// FIX: Alles in einer Zeile für den Linter
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mockPush }) }));

const BreadcrumbStub = {
  name: 'BreadcrumbStub',
  props: ['model'],
  template: '<div class="p-breadcrumb-stub"></div>',
};

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
    // FIX: Use vi.mocked() instead of 'as any' for type safety
    vi.mocked(propertyService.getBreadcrumbPath).mockResolvedValue([
      {
        title: 'Property A',
        id: 'prop-1',
        type: 'PROPERTY',
      },
      {
        title: 'My Unit',
        id: 'unit-1',
        type: 'APARTMENT',
      },
    ]);

    const wrapper = mount(UnitBreadcrumb, {
      props: defaultProps,
      global: { stubs: { Breadcrumb: BreadcrumbStub } },
    });

    await flushPromises();

    const breadcrumb = wrapper.findComponent(BreadcrumbStub);
    expect(breadcrumb.exists()).toBe(true);

    const model = breadcrumb.props('model');
    expect(model).toHaveLength(2);
    expect(model[0].label).toBe('Property A');
    expect(model[1].label).toBe('My Unit');
    expect(model[1].disabled).toBe(true);
  });

  it('renders correctly in Create mode', async () => {
    const createProps = {
      projectId: 'proj-1',
      parentId: 'prop-1',
      mode: 'create' as const,
    };

    vi.mocked(propertyService.getBreadcrumbPath).mockResolvedValue([
      {
        title: 'Property A',
        id: 'prop-1',
        type: 'PROPERTY',
      },
    ]);

    const wrapper = mount(UnitBreadcrumb, {
      props: createProps,
      global: { stubs: { Breadcrumb: BreadcrumbStub } },
    });

    await flushPromises();

    const breadcrumb = wrapper.findComponent(BreadcrumbStub);
    const model = breadcrumb.props('model');

    expect(model).toHaveLength(2);
    expect(model[0].label).toBe('Property A');
    expect(model[1].label).toBe('Neu anlegen');
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
      if (uid === 'prop-1') {
        return Promise.resolve([
          {
            title: 'Property A',
            id: 'prop-1',
            type: 'PROPERTY',
          },
        ]);
      }
      return Promise.resolve([]);
    });

    const wrapper = mount(UnitBreadcrumb, {
      props: siteProps,
      global: { stubs: { Breadcrumb: BreadcrumbStub } },
    });

    await flushPromises();

    const breadcrumb = wrapper.findComponent(BreadcrumbStub);
    const model = breadcrumb.props('model');

    expect(model).toHaveLength(2);
    expect(model[0].label).toBe('Property A');
    expect(model[1].label).toBe('My Site');
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

    expect(model).toHaveLength(1);
    expect(model[0].label).toBe('My Unit');
  });

  it('shows "Zur Übersicht" only if absolutely no info is available', async () => {
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
    expect(model[0].label).toBe('Zur Übersicht');
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
    
    // FIX: Alles in einer Zeile, da das Objekt klein ist
    vi.mocked(propertyService.getProperty).mockResolvedValue({ title: 'Direct Property' });

    const wrapper = mount(UnitBreadcrumb, {
      props: siteProps,
      global: { stubs: { Breadcrumb: BreadcrumbStub } },
    });

    await flushPromises();

    const breadcrumb = wrapper.findComponent(BreadcrumbStub);
    const model = breadcrumb.props('model');

    expect(model).toHaveLength(2);
    expect(model[0].label).toBe('Direct Property');
    expect(model[1].label).toBe('Außenanlage');
  });
});