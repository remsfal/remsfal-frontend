import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
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

const mockComplexData = [
  {
    key: '12914454-eb0c-483c-b93a-020c6175eaea',
    data: {
      type: EntityType.Property,
      title: 'Eigentum 1',
      description: 'First property description',
      tenant: '',
      usable_space: 3100,
    },
    children: [
      {
        key: '450c5f1d-3af6-4c96-9a93-6d812bcd7ea1',
        data: {
          type: EntityType.Building,
          title: 'Building 1',
          description: 'First building description',
          tenant: '',
          usable_space: 1100,
        },
        children: [
          {
            key: '18729a9f-5d53-42d8-b49e-5be15605f1d0',
            data: {
              type: EntityType.Apartment,
              title: 'Apartment 1A',
              description: 'First apartment in Building 1',
              tenant: '',
              usable_space: 180,
            },
            children: [],
          },
          {
            key: '550e8400-e29b-41d4-a716-446655440001',
            data: {
              type: EntityType.Commercial,
              title: 'Commercial 1A',
              description: 'First commercial in Building 1.',
              tenant: '',
              usable_space: 0,
            },
            children: [],
          },
          {
            key: '74e11b4e-b64f-4057-b605-13b03c8b2b9d',
            data: {
              type: EntityType.Garage,
              title: 'Garage 1A',
              description: 'Garage for Building 1',
              tenant: '',
              usable_space: 35,
            },
            children: [],
          },
        ],
      },
      {
        key: '550e8400-e29b-41d4-a716-446655440000',
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
    key: '3146c0dd-431a-43fb-90d2-e0121069aad7',
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
    expect(rows.length).toBe(4); // 2 data rows + 1 header row + 1 button row

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
});
