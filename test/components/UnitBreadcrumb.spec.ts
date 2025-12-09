import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import UnitBreadcrumb from '../../src/components/UnitBreadcrumb.vue';
import { propertyService } from '../../src/services/PropertyService';

// Mocks
// Wir müssen sicherstellen, dass alle Methoden gemockt sind, die wir nutzen
vi.mock('../../src/services/PropertyService', () => ({
  propertyService: {
    getBreadcrumbPath: vi.fn(),
    getProperty: vi.fn(),
  },
}));

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

const BreadcrumbStub = {
  name: 'BreadcrumbStub',
  props: ['model'],
  template: '<div class="p-breadcrumb-stub"></div>'
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
    currentTitle: 'My Unit'
  };

  it('renders correctly in Edit mode (Happy Path)', async () => {
    (propertyService.getBreadcrumbPath as any).mockResolvedValue([
      { title: 'Property A', id: 'prop-1', type: 'PROPERTY' },
      { title: 'My Unit', id: 'unit-1', type: 'APARTMENT' }
    ]);

    const wrapper = mount(UnitBreadcrumb, {
      props: defaultProps,
      global: { stubs: { Breadcrumb: BreadcrumbStub } }
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
      mode: 'create' as const
    };

    (propertyService.getBreadcrumbPath as any).mockResolvedValue([
      { title: 'Property A', id: 'prop-1', type: 'PROPERTY' }
    ]);

    const wrapper = mount(UnitBreadcrumb, {
      props: createProps,
      global: { stubs: { Breadcrumb: BreadcrumbStub } }
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
      mode: 'edit' as const
    };

    // Szenario: Baum gibt leeren Pfad für Site, aber korrekten Pfad für Property
    (propertyService.getBreadcrumbPath as any).mockImplementation((pid: string, uid: string) => {
        if (uid === 'site-1') return Promise.resolve([]);
        if (uid === 'prop-1') return Promise.resolve([{ title: 'Property A', id: 'prop-1', type: 'PROPERTY' }]);
        return Promise.resolve([]);
    });

    const wrapper = mount(UnitBreadcrumb, {
      props: siteProps,
      global: { stubs: { Breadcrumb: BreadcrumbStub } }
    });

    await flushPromises();

    const breadcrumb = wrapper.findComponent(BreadcrumbStub);
    const model = breadcrumb.props('model');

    expect(model).toHaveLength(2);
    expect(model[0].label).toBe('Property A');
    expect(model[1].label).toBe('My Site');
  });

  it('shows fallback (current title) when backend fails', async () => {
    // Backend ist down -> Error
    (propertyService.getBreadcrumbPath as any).mockRejectedValue(new Error('Backend down'));

    const wrapper = mount(UnitBreadcrumb, {
      props: defaultProps,
      global: { stubs: { Breadcrumb: BreadcrumbStub } }
    });

    await flushPromises();

    const breadcrumb = wrapper.findComponent(BreadcrumbStub);
    const model = breadcrumb.props('model');

    // KORREKTUR: Wir erwarten nicht "Zur Übersicht", sondern den Namen der aktuellen Einheit.
    // Das ist besseres UX ("Ich sehe wo ich bin, auch wenn der Pfad fehlt").
    expect(model).toHaveLength(1);
    expect(model[0].label).toBe('My Unit');
  });

  it('shows "Zur Übersicht" only if absolutely no info is available', async () => {
    // Backend down UND kein Titel/ID bekannt
    (propertyService.getBreadcrumbPath as any).mockRejectedValue(new Error('Backend down'));

    const wrapper = mount(UnitBreadcrumb, {
      props: { 
          projectId: 'p1',
          mode: 'edit' 
          // Keine unitId, kein currentTitle
      },
      global: { stubs: { Breadcrumb: BreadcrumbStub } }
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
      currentTitle: 'Außenanlage'
    };
    
    // 1. Pfad laden schlägt fehl
    (propertyService.getBreadcrumbPath as any).mockRejectedValue(new Error('Tree Error'));
    
    // 2. Direktes Laden klappt
    (propertyService.getProperty as any).mockResolvedValue({ title: 'Direct Property' });

    const wrapper = mount(UnitBreadcrumb, {
      props: siteProps,
      global: { stubs: { Breadcrumb: BreadcrumbStub } }
    });

    await flushPromises();
    
    const breadcrumb = wrapper.findComponent(BreadcrumbStub);
    const model = breadcrumb.props('model');
    
    expect(model).toHaveLength(2);
    expect(model[0].label).toBe('Direct Property'); // Geladen via getProperty
    expect(model[1].label).toBe('Außenanlage');    // Manuell angehängt
  });
});