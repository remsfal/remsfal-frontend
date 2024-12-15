import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ObjectDataView from '@/views/ObjectDataView.vue';
import { EntityType } from '@/services/ProjectService.ts';

// Mock for the ProjectService
const getPropertyTreeMock = vi.fn(() =>
  Promise.resolve({
    nodes: [
      {
        key: '1',
        data: { title: 'Root', type: EntityType.Project },
        children: [],
      },
    ],
  }),
);

vi.mock('@/services/ProjectService', () => ({
  default: vi.fn().mockImplementation(() => ({
    getPropertyTree: getPropertyTreeMock,
  })),
  EntityType: {
    Apartment: 'apartment',
    Commercial: 'commercial',
    Garage: 'garage',
    Site: 'site',
    Building: 'building',
    Project: 'project',
    Property: 'property',
  },
}));

// Mock for the router
const mockRoutePush = vi.fn();
vi.mock('vue-router', async () => {
  return {
    RouterView: {},
    useRouter: () => {
      return {
        push: mockRoutePush,
      };
    },
  };
});

const mockComplexData = [
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
            key: 'garage-id-1',
            data: {
              type: EntityType.Garage,
              title: 'Garage 1A',
              description: 'First garage in Building 1',
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
];

describe('ObjectDataView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with fetched data', async () => {
    const wrapper = mount(ObjectDataView, {
      props: {
        projectId: '123',
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(wrapper.find('h1').text()).toBe('Objektdaten Ansicht');
    expect(wrapper.findComponent({ name: 'TreeTable' }).exists()).toBe(true);

    expect(getPropertyTreeMock).toHaveBeenCalledWith('123', 10, 0);
  });

  it('displays an error when fetch fails', async () => {
    getPropertyTreeMock.mockRejectedValueOnce(new Error('Fetch failed'));

    const wrapper = mount(ObjectDataView, {
      props: {
        projectId: '123',
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(wrapper.find('.alert-error').text()).toBe('Failed to fetch object data: Fetch failed');
  });

  it('renders the top level of the dataset correctly (unexpanded)', async () => {
    getPropertyTreeMock.mockResolvedValueOnce({ nodes: mockComplexData });

    const wrapper = mount(ObjectDataView, {
      props: { projectId: '123' },
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    const treeTable = wrapper.findComponent({ name: 'TreeTable' });
    expect(treeTable.exists()).toBe(true);

    const rows = wrapper.findAll('tr');
    expect(rows.length).toBe(4); // 1 header row + 2 data rows + 1 button row

    const header = wrapper.find('.p-treetable-header');
    expect(header.exists()).toBe(true);
    const headerButtons = header.findAll('button');
    expect(headerButtons[0].text()).toContain('Alle ausklappen');
    expect(headerButtons[1].text()).toContain('Alle einklappen');

    const columnHeaderRow = rows.find((row) => row.find('th'));
    expect(columnHeaderRow).not.toBeUndefined();
    expect(columnHeaderRow.text()).toContain('TitleTypBeschreibungMieterFläche');

    // Validate the bottom button row
    const buttonRow = rows[3];
    expect(buttonRow.text()).toContain('Grundstück erstellen');

    // Validate the data rows
    const propertyRow1 = rows[1];
    const propertyRow2 = rows[2];
    expect(propertyRow1).not.toBeUndefined();
    expect(propertyRow2).not.toBeUndefined();

    expect(propertyRow1.text()).toContain('Eigentum 1');
    expect(propertyRow1.text()).toContain('3100');
    expect(propertyRow1.text()).toContain('First property description');
    expect(propertyRow2.text()).toContain('Eigentum 2');
    expect(propertyRow2.text()).toContain('0');
    expect(propertyRow2.text()).toContain('Second property description');
  });

  it('expands all nodes and renders the dataset correctly', async () => {
    getPropertyTreeMock.mockResolvedValueOnce({ nodes: mockComplexData });

    const wrapper = mount(ObjectDataView, {
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

    // Validate garage
    const garageRow = rows[5];
    expect(garageRow).not.toBeUndefined();
    expect(garageRow.text()).toContain('Garage 1A');
    expect(garageRow.text()).toContain('300');
    expect(garageRow.text()).toContain('First garage in Building 1');

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
  });

  it('routes correctly when edit buttons are clicked', async () => {
    getPropertyTreeMock.mockResolvedValueOnce({ nodes: mockComplexData });

    const wrapper = mount(ObjectDataView, {
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
    expect(editButtons.length).toBe(7);

    const expectedRoutes = [
      '/project/123/property/property-id-1',
      '/project/123/building/building-id-1',
      '/project/123/apartment/apartment-id-1',
      '/project/123/commercial/commercial-id-1',
      '/project/123/garage/garage-id-1',
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
    getPropertyTreeMock.mockResolvedValueOnce({ nodes: mockComplexData });

    const wrapper = mount(ObjectDataView, {
      props: { projectId: '123' },
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    let rows = wrapper.findAll('tr');
    expect(rows.length).toBe(4);
    const collapsedLength = rows.length;

    const header = wrapper.find('.p-treetable-header');
    const expandAllButton = header
      .findAll('button')
      .find((btn) => btn.text().includes('Alle ausklappen'));
    expect(expandAllButton).not.toBeUndefined();
    await expandAllButton.trigger('click');

    await wrapper.vm.$nextTick();

    rows = wrapper.findAll('tr');
    expect(rows.length).toBe(12);

    const collapseAllButton = header
      .findAll('button')
      .find((btn) => btn.text().includes('Alle einklappen'));
    expect(collapseAllButton).not.toBeUndefined();
    await collapseAllButton.trigger('click');

    await wrapper.vm.$nextTick();

    rows = wrapper.findAll('tr');
    expect(rows.length).toBe(collapsedLength);
  });
});
