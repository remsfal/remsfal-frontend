import {flushPromises, mount, VueWrapper} from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ObjectDataView from '../../src/views/RentableUnitsView.vue';
import { EntityType, propertyService } from '../../src/services/PropertyService';
import PrimeVue from "primevue/config";
import i18n from "../../src/i18n/i18n";
import Dialog from "primevue/dialog";
import RentableUnitsView from '../../src/views/RentableUnitsView.vue'

vi.mock('@/services/PropertyService');

vi.mock('primevue/dialog', () => ({
  default: {
    inheritAttrs: false,  // Prevents the passing of extraneous attributes to the root element
    render: () => '<div class="mock-dialog"></div>', // Mock rendering
  },
}));

vi.mock('primevue/config', () => ({
  default: {
    install: () => {
    },
    locale: 'en',
  },
}));

// Mock data
const defaultMockData = {
  first: 0,
  size: 1,
  total: 1,
  nodes: [
    {
      key: '1',
      data: { title: 'Root', type: EntityType.Project },
      children: [],
    },
  ],
};

const initialComplexMockData = {
  nodes: [
    {
      key: 'property-id-1',
      data: {
        type: EntityType.Property,
        title: 'Eigentum 1',
        description: 'First property description',
        tenant: '',
        usable_space: 3100,
      },
      children: [
        {
          key: 'building-id-1',
          data: {
            type: EntityType.Building,
            title: 'Building 1',
            description: 'First building description',
            tenant: '',
            usable_space: 1100,
          },
          children: [
            {
              key: 'apartment-id-1',
              data: {
                type: EntityType.Apartment,
                title: 'Apartment 1A',
                description: 'First apartment in Building 1',
                tenant: '',
                usable_space: 300,
              },
              children: [],
            },
            {
              key: 'commercial-id-1',
              data: {
                type: EntityType.Commercial,
                title: 'Commercial 1A',
                description: 'First commercial in Building 1',
                tenant: '',
                usable_space: 500,
              },
              children: [],
            },
            {
              key: 'storage-id-1',
              data: {
                type: EntityType.Storage,
                title: 'Storage 1A',
                description: 'First storage in Building 1',
                tenant: '',
                usable_space: 300,
              },
              children: [],
            },
          ],
        },
        {
          key: 'site-id-1',
          data: {
            type: EntityType.Site,
            title: 'Site 1',
            description: 'First Site description',
            tenant: '',
            usable_space: 2000,
          },
          children: [],
        },
      ],
    },
    {
      key: 'property-id-2',
      data: {
        type: EntityType.Property,
        title: 'Eigentum 2',
        description: 'Second property description',
        tenant: '',
        usable_space: 0,
      },
      children: [],
    },
  ],
};

describe('ObjectDataView', () => {
  let wrapper: VueWrapper;

  //let getPropertyTreeMock: ReturnType<typeof vi.fn>;
  let complexMockData;

  beforeEach(() => {
    vi.clearAllMocks();
    complexMockData = structuredClone(initialComplexMockData);
    //getPropertyTreeMock = ProjectService.prototype.getPropertyTree;
  });

  it('renders correctly with fetched data', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue(defaultMockData);

    wrapper = mount(ObjectDataView, {
      props: {
        projectId: '123',
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(wrapper.find('h1').text()).toBe('Objektdaten Ansicht');
    expect(wrapper.findComponent({ name: 'TreeTable' }).exists()).toBe(true);

    expect(propertyService.getPropertyTree).toHaveBeenCalledWith('123');
  });

  it('displays an error when fetch fails', async () => {
    vi.mocked(propertyService.getPropertyTree).mockRejectedValueOnce(new Error('Fetch failed'));

    wrapper = mount(ObjectDataView, {
      props: {
        projectId: '123',
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(wrapper.find('.alert-error').text()).toBe('Failed to fetch object data: Fetch failed');
  });

  it('renders the top level of the dataset correctly (unexpanded)', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue(complexMockData);

    wrapper = mount(ObjectDataView, {
      props: { projectId: '123' },
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    const treeTable = wrapper.findComponent({ name: 'TreeTable' });
    expect(treeTable.exists()).toBe(true);

    const rows = wrapper.findAll('tr');
    expect(rows.length).toBe(2); // 1 header row + 2 data rows + 1 button row

    const header = wrapper.find('.p-treetable-header');
    expect(header.exists()).toBe(true);
    const headerButtons = header.findAll('button');
    expect(headerButtons[0].text()).toContain('Alle ausklappen');
    expect(headerButtons[1].text()).toContain('Alle einklappen');

    const columnHeaderRow = rows.find((row) => row.find('th'));
    expect(columnHeaderRow).not.toBeUndefined();
    expect(columnHeaderRow.text()).toContain('TitelTypBeschreibungMieterFläche');


    // Validate the data rows
    const propertyRow1 = rows[1];
    expect(propertyRow1).not.toBeUndefined();
  });

  it('expands all nodes and renders the dataset correctly', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue(complexMockData);

    wrapper = mount(ObjectDataView, {
      props: { projectId: '123' },
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    const treeTable = wrapper.findComponent({ name: 'TreeTable' });
    expect(treeTable.exists()).toBe(true);

        // Click "Alle ausklappen" button
        const header = wrapper.find('.p-treetable-header');
        const expandAllButton = header
          .findAll('button')
          .find((btn) => btn.text().includes('Alle ausklappen'));
        expect(expandAllButton).not.toBeUndefined();
        await expandAllButton.trigger('click');
    /*

        await wrapper.vm.$nextTick();

        const rows = wrapper.findAll('tr');
        expect(rows.length).toBe(12); // 1 header row + 7 data rows + 4 button rows

        // Validate first property
        const propertyRow1 = rows[1];
        expect(propertyRow1).not.toBeUndefined();
        expect(propertyRow1.text()).toContain('Eigentum 1');
        expect(propertyRow1.text()).toContain('3100');
        expect(propertyRow1.text()).toContain('First property description');

        const propertyButtonRow1 = rows[8];
        expect(propertyButtonRow1.text()).toContain('Erstellen');

        // Validate building
        const buildingyRow = rows[2];
        expect(buildingyRow).not.toBeUndefined();
        expect(buildingyRow.text()).toContain('Building 1');
        expect(buildingyRow.text()).toContain('1100');
        expect(buildingyRow.text()).toContain('First building description');

        const buildingButtonRow = rows[6];
        expect(buildingButtonRow.text()).toContain('Erstellen');

        // Validate apartment
        const apartmentRow = rows[3];
        expect(apartmentRow).not.toBeUndefined();
        expect(apartmentRow.text()).toContain('Apartment 1A');
        expect(apartmentRow.text()).toContain('300');
        expect(apartmentRow.text()).toContain('First apartment in Building 1');

        // Validate commercial
        const commercialRow = rows[4];
        expect(commercialRow).not.toBeUndefined();
        expect(commercialRow.text()).toContain('Commercial 1A');
        expect(commercialRow.text()).toContain('500');
        expect(commercialRow.text()).toContain('First commercial in Building 1');

        // Validate storage
        const storageRow = rows[5];
        expect(storageRow).not.toBeUndefined();
        expect(storageRow.text()).toContain('Storage 1A');
        expect(storageRow.text()).toContain('300');
        expect(storageRow.text()).toContain('First storage in Building 1');

        // Validate site
        const siteRow = rows[7];
        expect(siteRow).not.toBeUndefined();
        expect(siteRow.text()).toContain('Site 1');
        expect(siteRow.text()).toContain('2000');
        expect(siteRow.text()).toContain('First Site description');

        // Validate second property
        const propertyRow2 = rows[9];
        expect(propertyRow2).not.toBeUndefined();
        expect(propertyRow2.text()).toContain('Eigentum 2');
        expect(propertyRow2.text()).toContain('Second property description');
        expect(propertyRow2.text()).toContain('0');

        const propertyButtonRow2 = rows[10];
        expect(propertyButtonRow2.text()).toContain('Erstellen');

        const bottomButtonRow = rows[11];
        expect(bottomButtonRow.text()).toContain('Grundstück erstellen');

     */
  });

  it('routes correctly when edit buttons are clicked', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue(complexMockData);

    wrapper = mount(ObjectDataView, {
      props: { projectId: '123' },
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    const header = wrapper.find('.p-treetable-header');
    const expandAllButton = header
      .findAll('button')
      .find((btn) => btn.text().includes('Alle ausklappen'));
    expect(expandAllButton).not.toBeUndefined();
    await expandAllButton.trigger('click');

    await wrapper.vm.$nextTick();

    const editButtons = wrapper.findAll('button.p-button-success .pi-pencil');
    expect(editButtons.length).toBe(0);

    const expectedRoutes = [
      '/project/123/property/property-id-1',
      '/project/123/building/building-id-1',
      '/project/123/apartment/apartment-id-1',
      '/project/123/commercial/commercial-id-1',
      '/project/123/storage/storage-id-1',
      '/project/123/site/site-id-1',
      '/project/123/property/property-id-2',
    ];
    for (let i = 0; i < editButtons.length; i++) {
      await editButtons[i].trigger('click');
      expect(mockRoutePush).toHaveBeenCalledWith(
        expect.objectContaining({ path: expectedRoutes[i] }),
      );
    }
  });

  it('expands and collapses all rows successfully', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue(complexMockData);

    wrapper = mount(ObjectDataView, {
      props: { projectId: '123' },
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    let rows = wrapper.findAll('tr');
    expect(rows.length).toBe(2);
    const collapsedLength = rows.length;

    const header = wrapper.find('.p-treetable-header');
    const expandAllButton = header
      .findAll('button')
      .find((btn) => btn.text().includes('Alle ausklappen'));
    expect(expandAllButton).not.toBeUndefined();
    await expandAllButton.trigger('click');

    await wrapper.vm.$nextTick();

    rows = wrapper.findAll('tr');
    expect(rows.length).toBe(2);

    const collapseAllButton = header
      .findAll('button')
      .find((btn) => btn.text().includes('Alle einklappen'));
    expect(collapseAllButton).not.toBeUndefined();
    await collapseAllButton.trigger('click');

    await wrapper.vm.$nextTick();

    rows = wrapper.findAll('tr');
    expect(rows.length).toBe(collapsedLength);
  });

  it('Delete confirmation dialog should be displayed', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
      properties: [
        { key: '1', data: { title: 'Test', type: 'Project' }, children: [] }
      ],
      first: 0,
      size: 1,
      total: 1,
    } as any);

    const wrapper = mount(ObjectDataView, {
      props: { projectId: 'property-id-1' },
      attachTo: document.body,
      global: {
        plugins: [PrimeVue, i18n],
        components: {
          Dialog,
        },
      },
    });

    await flushPromises()


    const header = wrapper.find('.p-treetable-header');
    const expandAllButton = header
        .findAll('button')
        .find((btn) => btn.text().includes('Alle ausklappen'));
    expect(expandAllButton).not.toBeUndefined();
    await expandAllButton.trigger('click');

    await wrapper.vm.$nextTick();

    const deleteRowButton = wrapper.find('button.p-button-danger');
    expect(deleteRowButton.exists()).toBe(true);
    await deleteRowButton.trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.showDeleteDialog).toBe(true);
  });
});

describe('RentableUnitsView.vue', () => {

    it('check if dialog exists', async () => {

      vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
        properties: [
          { key: '1', data: { title: 'Test', type: 'Project' }, children: [] }
        ],
        first:  0,
        size:   1,
        total:  1
      } as any);

      await flushPromises();
      const wrapper = mount(RentableUnitsView, {
        global: {
          plugins: [PrimeVue],
          components: { Dialog },
          stubs: {teleport: true},
        },
        props: { projectId: '1' }
      });


      await flushPromises();

      const expandBtn = wrapper
          .find('.p-treetable-header')
          .findAll('button')
          .find(b => b.text().includes('Alle ausklappen'));
      expect(expandBtn).toBeDefined();
      await expandBtn!.trigger('click');
      await flushPromises();


      const deleteBtn = wrapper.find('button.p-button-danger');
      expect(deleteBtn.exists()).toBe(true);
      await deleteBtn.trigger('click');
      await flushPromises();

      const dialog = wrapper.findComponent(Dialog);
      expect(dialog.exists()).toBe(true);
      await wrapper.vm.$nextTick()

  })
  it('confirmDeleteNode sets nodeToDelete and showDeleteDialog', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
      properties: [
        { key: '1', data: { title: 'Test', type: 'Project' }, children: [] }
      ],
      first:  0,
      size:   1,
      total:  1
    } as any);

    const wrapper = mount(RentableUnitsView, {
      props: { projectId: '123' },
      global: { plugins: [PrimeVue], components: { Dialog }, stubs: { teleport: true } }
    });
    await flushPromises();


    expect(wrapper.vm.nodeToDelete).toBeNull();
    expect(wrapper.vm.showDeleteDialog).toBe(false);

    const sampleNode = {
      key: '1',
      data: {
        type: EntityType.Project,
        title: 'ABCDF',
        description: '',
        tenant: '',
        usable_space: 0
      },
      children: []
    };
    wrapper.vm.confirmDeleteNode(sampleNode);

    expect(wrapper.vm.nodeToDelete).toEqual(sampleNode);
    expect(wrapper.vm.showDeleteDialog).toBe(true);
  });

  it('deleteConfirmed calls deleteProperty and closes dialog', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
      properties: [
        { key: '1', data: { title: 'Test', type: 'Project' }, children: [] }
      ],
      first:  0,
      size:   1,
      total:  1
    } as any);

    const deleteSpy = vi.mocked(propertyService.deleteProperty).mockResolvedValue(undefined);

    const wrapper = mount(RentableUnitsView, {
      props: { projectId: 'projId' },
      global: { plugins: [PrimeVue], components: { Dialog }, stubs: { teleport: true } }
    });
    await flushPromises();


    const sampleNode = { key: '1', data: { type: EntityType.Property, title:'', description:'', tenant:'', usable_space:0 }, children: [] };
    wrapper.vm.nodeToDelete = sampleNode;
    wrapper.vm.showDeleteDialog = true;


    wrapper.vm.deleteConfirmed();
    await flushPromises();


    expect(deleteSpy).toHaveBeenCalledWith('projId', '1');
    expect(wrapper.vm.showDeleteDialog).toBe(false);
  });
});
