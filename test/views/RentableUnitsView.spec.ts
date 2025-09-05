import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RentableUnitsView from '../../src/views/RentableUnitsView.vue';
import { EntityType, propertyService } from '../../src/services/PropertyService';
import PrimeVue from 'primevue/config';
import i18n from '../../src/i18n/i18n';

vi.mock('@/services/PropertyService');

describe('RentableUnitsView', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with fetched data', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
      properties: [
        {
          key: '1',
          data: { type: 'PROPERTY', title: 'Root', usable_space: 100 },
          children: [],
        },
      ],
      first: 0,
      size: 1,
      total: 1,
    } as any);

    wrapper = mount(RentableUnitsView, {
      props: { projectId: '123' },
      global: { plugins: [PrimeVue, i18n], stubs: { teleport: true } },
    });

    await flushPromises();

    expect(wrapper.find('h1').text()).toBe('Wirtschaftseinheiten');
    expect(wrapper.findComponent({ name: 'TreeTable' }).exists()).toBe(true);
    expect(propertyService.getPropertyTree).toHaveBeenCalledWith('123');
  });

  it('displays an error when fetch fails', async () => {
    vi.mocked(propertyService.getPropertyTree).mockRejectedValueOnce(new Error('Fetch failed'));

    wrapper = mount(RentableUnitsView, {
      props: { projectId: '123' },
      global: { plugins: [PrimeVue, i18n], stubs: { teleport: true } },
    });

    await flushPromises();

    expect(wrapper.find('.alert-error').text()).toBe('Failed to fetch object data: Fetch failed');
  });

  it('opens delete confirmation dialog when delete button is clicked', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
      properties: [
        { key: '1', data: { title: 'Test', type: EntityType.Property }, children: [] },
      ],
      first: 0,
      size: 1,
      total: 1,
    } as any);

    wrapper = mount(RentableUnitsView, {
      props: { projectId: '1' },
      attachTo: document.body,
      global: { plugins: [PrimeVue, i18n], stubs: { teleport: true } },
    });

    await flushPromises();

    const deleteBtn = wrapper.find('[data-testid="deleteNode"]');
    expect(deleteBtn.exists()).toBe(true);

    await deleteBtn.trigger('click');
    await flushPromises();

    expect((wrapper.vm as any).showDeleteDialog).toBe(true);
  });

  it('confirmDeleteNode sets nodeToDelete and showDeleteDialog', async () => {
    wrapper = mount(RentableUnitsView, {
      props: { projectId: '123' },
      attachTo: document.body,
      global: { plugins: [PrimeVue, i18n], stubs: { teleport: true } },
    });

    await flushPromises();

    const sampleNode = {
      key: '1',
      data: { type: EntityType.Project, title: 'ABCDF', description: '', tenant: '', usable_space: 0 },
      children: [],
    };
    (wrapper.vm as any).confirmDeleteNode(sampleNode);

    expect((wrapper.vm as any).nodeToDelete).toEqual(sampleNode);
    expect((wrapper.vm as any).showDeleteDialog).toBe(true);
  });

  it('deleteConfirmed calls deleteProperty and closes dialog', async () => {
    const deleteSpy = vi.mocked(propertyService.deleteProperty).mockResolvedValue(undefined);

    wrapper = mount(RentableUnitsView, {
      props: { projectId: 'projId' },
      attachTo: document.body,
      global: { plugins: [PrimeVue, i18n], stubs: { teleport: true } },
    });

    await flushPromises();

    const sampleNode = {
      key: '1',
      data: { type: EntityType.Property, title: '', description: '', tenant: '', usable_space: 0 },
      children: [],
    };
    (wrapper.vm as any).nodeToDelete = sampleNode;
    (wrapper.vm as any).showDeleteDialog = true;

    (wrapper.vm as any).deleteConfirmed();
    await flushPromises();

    expect(deleteSpy).toHaveBeenCalledWith('projId', '1');
    expect((wrapper.vm as any).showDeleteDialog).toBe(false);
    expect((wrapper.vm as any).nodeToDelete).toBeNull();
  });
});
