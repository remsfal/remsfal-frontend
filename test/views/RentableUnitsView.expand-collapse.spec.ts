import {flushPromises, mount} from '@vue/test-utils';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import RentableUnitsView from '../../src/views/RentableUnitsView.vue';
import { propertyService } from '../../src/services/PropertyService';
import PrimeVue from 'primevue/config';
import i18n from '../../src/i18n/i18n';

vi.mock('@/services/PropertyService');

describe('RentableUnitsView Expand/Collapse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('expandAll should expand all nodes', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
      properties: [
        {
          key: '1',
          data: { type: 'PROPERTY', title: 'Property 1', usable_space: 100 },
          children: [
            {
              key: '1-1',
              data: { type: 'BUILDING', title: 'Building 1', usable_space: 50 },
              children: [],
            },
          ],
        },
        {
          key: '2',
          data: { type: 'PROPERTY', title: 'Property 2', usable_space: 200 },
          children: [],
        },
      ],
      first: 0,
      size: 2,
      total: 2,
    } as any);

    const wrapper = mount(RentableUnitsView, {
      props: { projectId: '123' },
      global: { plugins: [PrimeVue, i18n], stubs: { teleport: true } },
    });

    await flushPromises();

    // Initially, all nodes should be expanded (due to expandAll() in onMounted)
    const vm = wrapper.vm as any;
    expect(Object.keys(vm.expandedKeys).length).toBeGreaterThan(0);
    expect(vm.expandedKeys['1']).toBe(true);
    expect(vm.expandedKeys['1-1']).toBe(true);
    expect(vm.expandedKeys['2']).toBe(true);
  });

  it('collapseAll should collapse all nodes', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
      properties: [
        {
          key: '1',
          data: { type: 'PROPERTY', title: 'Property 1', usable_space: 100 },
          children: [
            {
              key: '1-1',
              data: { type: 'BUILDING', title: 'Building 1', usable_space: 50 },
              children: [],
            },
          ],
        },
      ],
      first: 0,
      size: 1,
      total: 1,
    } as any);

    const wrapper = mount(RentableUnitsView, {
      props: { projectId: '123' },
      global: { plugins: [PrimeVue, i18n], stubs: { teleport: true } },
    });

    await flushPromises();

    // Initially expanded
    const vm = wrapper.vm as any;
    expect(Object.keys(vm.expandedKeys).length).toBeGreaterThan(0);

    // Find and click collapse button
    const collapseBtn = wrapper.findAll('button').find(btn => 
      btn.text().includes('Alle einklappen')
    );
    await collapseBtn?.trigger('click');
    await flushPromises();

    // After collapse, expandedKeys should be empty
    expect(Object.keys(vm.expandedKeys).length).toBe(0);
  });

  it('expandAll should re-expand all nodes after collapse', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
      properties: [
        {
          key: '1',
          data: { type: 'PROPERTY', title: 'Property 1', usable_space: 100 },
          children: [
            {
              key: '1-1',
              data: { type: 'BUILDING', title: 'Building 1', usable_space: 50 },
              children: [],
            },
          ],
        },
      ],
      first: 0,
      size: 1,
      total: 1,
    } as any);

    const wrapper = mount(RentableUnitsView, {
      props: { projectId: '123' },
      global: { plugins: [PrimeVue, i18n], stubs: { teleport: true } },
    });

    await flushPromises();

    const vm = wrapper.vm as any;
    
    // Collapse all
    const collapseBtn = wrapper.findAll('button').find(btn => 
      btn.text().includes('Alle einklappen')
    );
    await collapseBtn?.trigger('click');
    await flushPromises();
    expect(Object.keys(vm.expandedKeys).length).toBe(0);

    // Expand all
    const expandBtn = wrapper.findAll('button').find(btn => 
      btn.text().includes('Alle ausklappen')
    );
    await expandBtn?.trigger('click');
    await flushPromises();

    // Should be expanded again
    expect(Object.keys(vm.expandedKeys).length).toBeGreaterThan(0);
    expect(vm.expandedKeys['1']).toBe(true);
    expect(vm.expandedKeys['1-1']).toBe(true);
  });
});
