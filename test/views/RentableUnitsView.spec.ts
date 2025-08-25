import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ObjectDataView from '../../src/views/RentableUnitsView.vue';
import { EntityType, propertyService } from '../../src/services/PropertyService';
import PrimeVue from "primevue/config";
import i18n from "../../src/i18n/i18n";
import Dialog from "primevue/dialog";

vi.mock('@/services/PropertyService');
vi.mock('primevue/dialog', () => ({
  default: {
    inheritAttrs: false,
    render: () => '<div class="mock-dialog"></div>',
  },
}));
vi.mock('primevue/config', () => ({
  default: { install: () => {}, locale: 'en' },
}));

const defaultMockData = {
  first: 0,
  size: 1,
  total: 1,
  nodes: [
    { key: '1', data: { title: 'Root', type: EntityType.Project }, children: [] },
  ],
};

const initialComplexMockData = {
  nodes: [
    {
      key: 'property-id-1',
      data: { type: EntityType.Property, title: 'Eigentum 1', description: 'First property description', tenant: '', usable_space: 3100 },
      children: [
        { key: 'building-id-1', data: { type: EntityType.Building, title: 'Building 1', description: 'First building description', tenant: '', usable_space: 1100 }, children: [] }
      ],
    },
    { key: 'property-id-2', data: { type: EntityType.Property, title: 'Eigentum 2', description: 'Second property description', tenant: '', usable_space: 0 }, children: [] },
  ],
};

describe('ObjectDataView', () => {
  let wrapper: VueWrapper<any>;
  let complexMockData;

  beforeEach(() => {
    vi.clearAllMocks();
    complexMockData = structuredClone(initialComplexMockData);
  });

  it('renders correctly with fetched data', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue(defaultMockData);

    wrapper = mount(ObjectDataView, { props: { projectId: '123' } });
    await flushPromises();

    expect(wrapper.find('h1').text()).toBe('Wirtschaftseinheiten');
    expect(wrapper.findComponent({ name: 'TreeTable' }).exists()).toBe(true);
    expect(propertyService.getPropertyTree).toHaveBeenCalledWith('123');
  });

  it('displays an error when fetch fails', async () => {
    vi.mocked(propertyService.getPropertyTree).mockRejectedValueOnce(new Error('Fetch failed'));

    wrapper = mount(ObjectDataView, { props: { projectId: '123' } });
    await flushPromises();

    expect(wrapper.find('.alert-error').text()).toContain('Fetch failed');
  });

  it('check delete dialog', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue(defaultMockData);

    wrapper = mount(ObjectDataView, {
      props: { projectId: '1' },
      global: { plugins: [PrimeVue, i18n], components: { Dialog } },
    });
    await flushPromises();

    const deleteBtn = wrapper.find('button.p-button-danger');
    expect(deleteBtn.exists()).toBe(true);
    await deleteBtn.trigger('click');
    await wrapper.vm.$nextTick();

    expect((wrapper.vm as any).showDeleteDialog).toBe(true);
  });
});

describe('RentableUnitsView.vue', () => {
  it('confirmDeleteNode sets nodeToDelete and showDeleteDialog', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue(defaultMockData);

    const wrapper = mount(ObjectDataView, {
      props: { projectId: '123' },
      global: { plugins: [PrimeVue], components: { Dialog }, stubs: { teleport: true } },
    });
    await flushPromises();

    const sampleNode = { key: '1', data: { type: EntityType.Project, title: 'ABCDF', tenant: '', usable_space: 0 }, children: [] };
    (wrapper.vm as any).confirmDeleteNode(sampleNode);

    expect((wrapper.vm as any).nodeToDelete).toEqual(sampleNode);
    expect((wrapper.vm as any).showDeleteDialog).toBe(true);
  });

  it('deleteConfirmed calls deleteProperty and closes dialog', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue(defaultMockData);
    const deleteSpy = vi.mocked(propertyService.deleteProperty).mockResolvedValue(undefined);

    const wrapper = mount(ObjectDataView, { props: { projectId: 'projId' }, global: { plugins: [PrimeVue], components: { Dialog }, stubs: { teleport: true } } });
    await flushPromises();

    (wrapper.vm as any).nodeToDelete = { key: '1', data: { type: EntityType.Property, title:'', tenant:'', usable_space:0 }, children: [] };
    (wrapper.vm as any).showDeleteDialog = true;

    (wrapper.vm as any).deleteConfirmed();
    await flushPromises();

    expect(deleteSpy).toHaveBeenCalledWith('projId', '1');
    expect((wrapper.vm as any).showDeleteDialog).toBe(false);
  });
});
