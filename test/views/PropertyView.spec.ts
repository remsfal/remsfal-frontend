import { mount, flushPromises } from '@vue/test-utils';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import Component from '../../src/views/PropertyView.vue';
import { propertyService } from '../../src/services/PropertyService';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({useRouter: () => ({ push: mockPush }),}));

vi.mock('../../src/services/PropertyService', () => ({propertyService: { getProperty: vi.fn(), updateProperty: vi.fn() },}));

// MSW handler
let lastUpdatedProperty: Record<string, unknown> | null = null;

const handlers = [
  http.patch('/api/v1/projects/:projectId/units/:unitId/property', async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown> | undefined;
    lastUpdatedProperty = body ?? null;

    return HttpResponse.json({
      id: `${params.unitId}-property`,
      ...lastUpdatedProperty,
      updatedAt: new Date().toISOString(),
    });
  }),
];

beforeEach(() => {
  server.use(...handlers);
});

afterEach(() => {
  lastUpdatedProperty = null;
});

describe('PropertyView.vue', () => {
  let wrapper: any;

  beforeEach(async () => {
    (propertyService.getProperty as any).mockResolvedValue({
      title: 'Initial Property Title',
      description: 'Initial Property Description',
      cadastralDistrict: 'Initial District',
      sheetNumber: 'Sheet123',
      cadastralSection: 'Initial Corridor',
      plot: 'Initial Parcel',
      plotNumber: 42,
      landRegistry: 'Initial LandRegistry',
      economyType: 'GF Wohnen',
      location: 'Initial Location',
      plotArea: 100,
      space: 50.5,
    });

    wrapper = mount(Component, {props: { projectId: 'project1', unitId: 'unit1' },});

    await flushPromises();
  });

  it('loads property details on mount', () => {
    expect(wrapper.vm.title).toBe('Initial Property Title');
    expect(wrapper.vm.description).toBe('Initial Property Description');
    expect(wrapper.vm.district).toBe('Initial District');
    expect(wrapper.vm.sheetNumber).toBe('Sheet123');
    expect(wrapper.vm.corridor).toBe('Initial Corridor');
    expect(wrapper.vm.parcel).toBe('Initial Parcel');
    expect(wrapper.vm.plotNumber).toBe(42);
    expect(wrapper.vm.landRegisterEntry).toBe('Initial LandRegistry');
    expect(wrapper.vm.usageType).toBe('GF Wohnen');
    expect(wrapper.vm.location).toBe('Initial Location');
    expect(wrapper.vm.plotArea).toBe(100);
    expect(wrapper.vm.space).toBe(50.5);
  });

  it('enables save button only if data is modified', async () => {
    const saveButton = wrapper.find('button[type="submit"]');
    expect(saveButton.element.disabled).toBe(true);

    await wrapper.find('input#title').setValue('New Title');

    expect(wrapper.vm.hasChanges).toBe(true);
    expect(saveButton.attributes('disabled')).toBeUndefined();
  });

  it('calls updateProperty service with correct data when saved', async () => {
    (propertyService.updateProperty as any).mockImplementation(
      async (projectId, unitId, payload) => {
        // Let fetch go through MSW
        const res = await fetch(`/api/v1/projects/${projectId}/units/${unitId}/property`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        return res.json();
      },
    );

    wrapper.vm.title = 'New Title';
    await wrapper.vm.save();

    expect(lastUpdatedProperty).toEqual(
      expect.objectContaining({
        title: 'New Title',
        description: 'Initial Property Description',
        cadastralDistrict: 'Initial District',
        sheetNumber: 'Sheet123',
        cadastralSection: 'Initial Corridor', // Cadastral section of the property
        plot: 'Initial Parcel',              // Plot or parcel of the property
        plotNumber: 42,
        landRegistry: 'Initial LandRegistry',
        economyType: 'GF Wohnen',
        location: 'Initial Location',
        plotArea: 100,
        space: 50.5,
      }),
    );
  });

  it('validates plotArea is positive', async () => {
    wrapper.vm.plotArea = -100;
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.validationErrors).toContain('Grundstücksfläche darf nicht negativ sein.');
    expect(wrapper.vm.isValid).toBe(false);
  });

  it('validates plotNumber is greater than 0', async () => {
    wrapper.vm.plotNumber = 0;
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.validationErrors).toContain('Flurstücksnummer muss größer als 0 sein.');
    expect(wrapper.vm.isValid).toBe(false);
  });

  it('validates space is non-negative', async () => {
    wrapper.vm.space = -10;
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.validationErrors).toContain('Nutzfläche darf nicht negativ sein.');
    expect(wrapper.vm.isValid).toBe(false);
  });

  it('redirects to correct property view path after successful save', async () => {
    (propertyService.updateProperty as any).mockResolvedValue({});
    mockPush.mockClear();
    wrapper.vm.title = 'Updated Title';
    await wrapper.vm.save();
    await flushPromises();
    expect(mockPush).toHaveBeenCalledWith({ name: 'RentableUnits', params: { projectId: 'project1' } });
  });
});
