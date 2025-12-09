import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import UnitBreadcrumb from '@/components/UnitBreadcrumb.vue';
import { propertyService } from '@/services/PropertyService';
import { createRouter, createWebHistory } from 'vue-router';

// Mocks
vi.mock('@/services/PropertyService');

// Router Setup für Tests
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: { template: '<div>Home</div>' } },
    { path: '/units', name: 'RentableUnitsView', component: { template: '<div>Units</div>' } }
  ]
});

describe('UnitBreadcrumb.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    projectId: 'proj-1',
    unitId: 'unit-1',
    mode: 'edit' as const,
    currentTitle: 'My Unit'
  };

  it('renders correctly in Edit mode (Happy Path)', async () => {
    // Mock: Backend liefert Pfad zurück
    (propertyService.getBreadcrumbPath as any).mockResolvedValue([
      { title: 'Property A', id: 'prop-1', type: 'PROPERTY' },
      { title: 'My Unit', id: 'unit-1', type: 'APARTMENT' }
    ]);

    const wrapper = mount(UnitBreadcrumb, {
      props: defaultProps,
      global: { plugins: [router] }
    });

    await flushPromises();

    const breadcrumb = wrapper.findComponent({ name: 'Breadcrumb' });
    const model = breadcrumb.props('model');

    expect(model).toHaveLength(2);
    expect(model[0].label).toBe('Property A');
    expect(model[1].label).toBe('My Unit');
    expect(model[1].disabled).toBe(true); // Aktuelles Element deaktiviert
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
      global: { plugins: [router] }
    });

    await flushPromises();

    const breadcrumb = wrapper.findComponent({ name: 'Breadcrumb' });
    const model = breadcrumb.props('model');

    // Erwartet: Parent + "Neu anlegen"
    expect(model).toHaveLength(2);
    expect(model[0].label).toBe('Property A');
    expect(model[1].label).toBe('Neu anlegen');
    expect(model[1].icon).toBe('pi pi-plus');
  });

  it('handles contextParentId correctly (SiteView scenario)', async () => {
    const siteProps = {
      projectId: 'proj-1',
      unitId: 'site-1',
      contextParentId: 'prop-1', // Wir erzwingen das Grundstück
      currentTitle: 'My Site',
      mode: 'edit' as const
    };

    // Szenario: 
    // 1. Abfrage für Site -> Leer (Baumstruktur Problem)
    // 2. Abfrage für Property -> Treffer
    (propertyService.getBreadcrumbPath as any).mockImplementation((pid: string, uid: string) => {
        if (uid === 'site-1') return Promise.resolve([]);
        if (uid === 'prop-1') return Promise.resolve([{ title: 'Property A', id: 'prop-1', type: 'PROPERTY' }]);
        return Promise.resolve([]);
    });

    const wrapper = mount(UnitBreadcrumb, {
      props: siteProps,
      global: { plugins: [router] }
    });

    await flushPromises();

    const breadcrumb = wrapper.findComponent({ name: 'Breadcrumb' });
    const model = breadcrumb.props('model');

    // Erwartet: Property (durch contextParentId) + Site (manuell angehängt)
    expect(model).toHaveLength(2);
    expect(model[0].label).toBe('Property A');
    expect(model[1].label).toBe('My Site');
  });

  it('shows fallback when everything fails', async () => {
    (propertyService.getBreadcrumbPath as any).mockRejectedValue(new Error('Backend down'));

    const wrapper = mount(UnitBreadcrumb, {
      props: defaultProps,
      global: { plugins: [router] }
    });

    await flushPromises();

    const breadcrumb = wrapper.findComponent({ name: 'Breadcrumb' });
    const model = breadcrumb.props('model');

    expect(model).toHaveLength(1);
    expect(model[0].label).toBe('Zur Übersicht');
  });
  
  it('uses direct getProperty fallback if tree path fails', async () => {
      const siteProps = {
      projectId: 'proj-1',
      unitId: 'site-1',
      contextParentId: 'prop-1',
      mode: 'edit' as const
    };
    
    // Beide Pfad-Abfragen schlagen fehl
    (propertyService.getBreadcrumbPath as any).mockRejectedValue(new Error('Tree Error'));
    
    // Aber direkter Abruf geht
    (propertyService.getProperty as any).mockResolvedValue({ title: 'Direct Property' });

    const wrapper = mount(UnitBreadcrumb, {
      props: siteProps,
      global: { plugins: [router] }
    });

    await flushPromises();
    
    const breadcrumb = wrapper.findComponent({ name: 'Breadcrumb' });
    const model = breadcrumb.props('model');
    
    // Erwartet: Direct Property + Außenanlage
    expect(model[0].label).toBe('Direct Property');
    expect(model[1].label).toBe('Außenanlage');
  });
});