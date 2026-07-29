import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import RentableUnitSelect from '@/features/project/rentableUnits/components/RentableUnitSelect.vue';
import { propertyService } from '@/features/project/rentableUnits/services/PropertyService';
import type { PropertyListJson } from '@/features/project/rentableUnits/services/PropertyService';

vi.mock('@/features/project/rentableUnits/services/PropertyService', { spy: true });

describe('RentableUnitSelect.vue', () => {
  let wrapper: VueWrapper;

  const mockTree: PropertyListJson = {
    properties: [
      {
        key: 'property-1',
        data: {
          id: 'property-1', title: 'Property 1', type: 'PROPERTY',
        },
        children: [
          {
            key: 'apartment-1',
            data: {
              id: 'apartment-1', title: 'Apartment 101', type: 'APARTMENT',
            },
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    vi.spyOn(propertyService, 'getPropertyTree').mockResolvedValue(mockTree);

    wrapper = mount(RentableUnitSelect, {
      props: {
        projectId: 'project-123',
        modelValue: null,
      },
    });

    await flushPromises();
  });

  it('loads the property tree on mount', () => {
    expect(propertyService.getPropertyTree).toHaveBeenCalledWith('project-123');
  });

  it('renders a TreeSelect', () => {
    expect(wrapper.findComponent({ name: 'TreeSelect' }).exists()).toBe(true);
  });

  it('builds node labels from title and translated unit type', () => {
    const treeSelect = wrapper.findComponent({ name: 'TreeSelect' });
    const options = treeSelect.props('options') as Array<{
      key: string; label: string; children?: Array<{ key: string; label: string }>;
    }>;

    expect(options[0]?.label).toBe('Property 1 (Grundstück)');
    expect(options[0]?.children?.[0]?.label).toBe('Apartment 101 (Wohnung)');
  });

  it('marks PROPERTY containers as non-selectable', () => {
    const treeSelect = wrapper.findComponent({ name: 'TreeSelect' });
    const options = treeSelect.props('options') as Array<{ key: string; selectable: boolean }>;

    expect(options[0]?.selectable).toBe(false);
  });

  it('marks unit ids passed via excludeUnitIds as non-selectable', async () => {
    await wrapper.setProps({ excludeUnitIds: ['apartment-1'] });

    const treeSelect = wrapper.findComponent({ name: 'TreeSelect' });
    const options = treeSelect.props('options') as Array<{
      key: string; children?: Array<{ key: string; selectable: boolean }>;
    }>;

    expect(options[0]?.children?.[0]?.selectable).toBe(false);
  });

  it('emits update:modelValue when the TreeSelect value changes', async () => {
    const treeSelect = wrapper.findComponent({ name: 'TreeSelect' });
    await treeSelect.vm.$emit('update:modelValue', 'apartment-1');

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('apartment-1');
  });

  it('emits nodeSelect when a node is selected', async () => {
    const node = {
      key: 'apartment-1', data: {
        id: 'apartment-1', title: 'Apartment 101', type: 'APARTMENT' 
      },
    };
    const treeSelect = wrapper.findComponent({ name: 'TreeSelect' });
    await treeSelect.vm.$emit('nodeSelect', node);

    expect(wrapper.emitted('nodeSelect')?.[0]?.[0]).toEqual(node);
  });

  it('passes the invalid prop through as p-invalid class', async () => {
    await wrapper.setProps({ invalid: true });
    expect(wrapper.html()).toContain('p-invalid');
  });

  it('logs an error when loading the property tree fails', async () => {
    vi.mocked(propertyService.getPropertyTree).mockRejectedValue(new Error('network error'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    wrapper = mount(RentableUnitSelect, {props: { projectId: 'project-123', modelValue: null },});
    await flushPromises();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load property tree:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });
});
