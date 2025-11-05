import { mount, VueWrapper } from '@vue/test-utils';
import {describe, it, expect, vi, beforeEach, Mock} from 'vitest';
import Component from '../../src/views/BuildingView.vue';
import { buildingService } from '../../src/services/BuildingService';

const mockPush = vi.fn();

vi.mock('vue-router', () => ({useRouter: () => ({push: mockPush,}),}));

vi.mock('../../src/services/BuildingService', () => ({
  buildingService: {
    getBuilding: vi.fn(),
    updateBuilding: vi.fn(),
  },
}));

describe('BuildingView.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(async () => {
    (buildingService.getBuilding as Mock).mockResolvedValue({
      title: 'Initial Title',
      description: 'Initial Description',
      livingSpace: 100,
      commercialSpace: 50,
      usableSpace: 75,
      heatingSpace: 60,
      address: {
        street: 'Street 1',
        city: 'City',
        province: 'Province',
        zip: '12345',
        country: 'DE',
      },
    });

    wrapper = mount(Component, {
      props: {
        projectId: 'project1',
        unitId: 'unit1',
      },
    });

    // wait for any onMounted async calls
    await wrapper.vm.$nextTick();
  });

  it('blocks save and shows validation errors for negative surface values', async () => {
    wrapper.vm.livingSpace = -10;
    wrapper.vm.commercialSpace = -5;
    await wrapper.vm.$nextTick();

    await wrapper.vm.save();

    expect(wrapper.vm.validationErrors).toContain('Wohnfläche ist erforderlich und darf nicht negativ sein.');
    expect(wrapper.vm.validationErrors).toContain('Gewerbefläche ist erforderlich und darf nicht negativ sein.');
    expect(buildingService.updateBuilding).not.toHaveBeenCalled();
  });

  it('cancel calls window.close when window.opener exists', () => {
    window.close = vi.fn();

    Object.defineProperty(window, 'opener', {
      value: {},
      writable: true,
    });

    wrapper.vm.cancel();

    expect(window.close).toHaveBeenCalled();
  });

  it('validates that livingspace, commercialSpace, usableSpace, and heatingSpace are not negative', async () => {
    wrapper.vm.livingSpace = -1;
    wrapper.vm.commercialSpace = -2;
    wrapper.vm.usableSpace = -3;
    wrapper.vm.heatingSpace = -4;
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.validationErrors).toContain('Wohnfläche ist erforderlich und darf nicht negativ sein.');
    expect(wrapper.vm.validationErrors).toContain('Gewerbefläche ist erforderlich und darf nicht negativ sein.');
    expect(wrapper.vm.validationErrors).toContain('Nutzfläche ist erforderlich und darf nicht negativ sein.');
    expect(wrapper.vm.validationErrors).toContain('Heizfläche ist erforderlich und darf nicht negativ sein.');
    expect(wrapper.vm.isValid).toBe(false);
  });

  it('validates no errors when all values are zero or positive', async () => {
    wrapper.vm.livingSpace = 0;
    wrapper.vm.commercialSpace = 0;
    wrapper.vm.usableSpace = 0;
    wrapper.vm.heatingSpace = 0;
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.validationErrors.length).toBe(0);
    expect(wrapper.vm.isValid).toBe(true);
  });

  it('calls getBuilding on mount and sets data correctly', async () => {
    expect(buildingService.getBuilding).toHaveBeenCalledWith('project1', 'unit1');
    expect(wrapper.vm.title).toBe('Initial Title');
  });

  it('calls updateBuilding with correct data on save', async () => {
    (buildingService.updateBuilding as Mock).mockResolvedValue({});

    wrapper.vm.title = 'Updated Title';
    wrapper.vm.description = 'Updated Description';
    wrapper.vm.livingSpace = 120;
    wrapper.vm.commercialSpace = 60;
    wrapper.vm.usableSpace = 80;
    wrapper.vm.heatingSpace = 70;

    await wrapper.vm.save();

    expect(buildingService.updateBuilding).toHaveBeenCalledWith('project1', 'unit1', {
      title: 'Updated Title',
      description: 'Updated Description',
      livingSpace: 120,
      commercialSpace: 60,
      usableSpace: 80,
      heatingSpace: 70,
      address: {
        street: 'Street 1',
        city: 'City',
        province: 'Province',
        zip: '12345',
        country: { country: 'DE' },
      },
    });
  });

  it('redirects to correct building view path after successful save', async () => {
    (buildingService.updateBuilding as Mock).mockResolvedValue({});
    mockPush.mockClear();

    wrapper.vm.title = 'Updated Title';
    await wrapper.vm.save();

    expect(mockPush).toHaveBeenCalledWith({ name: 'RentableUnits', params: { projectId: 'project1' } });
  });
});
