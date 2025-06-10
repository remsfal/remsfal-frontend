import { mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import Component from '../../src/views/ModifyApartmentView.vue';
import { apartmentService } from '../../src/services/ApartmentService';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('../../src/services/ApartmentService', () => ({
  apartmentService: {
    getApartment: vi.fn(),
    updateApartment: vi.fn(),
  },
}));

describe('ApartmentUpdateView.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(async () => {
    (apartmentService.getApartment as Mock).mockResolvedValue({
      title: 'Initial Apartment Title',
      description: 'Initial Apartment Description',
      livingSpace: 100,
      usableSpace: 80,
      heatingSpace: 60,
      location: 'Initial Location',
    });

    wrapper = mount(Component, {
      props: {
        projectId: 'project1',
        apartmentId: 'apartment1',
      },
    });

    // wait for any onMounted async calls
    await wrapper.vm.$nextTick();
  });

  it('loads apartment details on mount', () => {
    expect(wrapper.vm.title).toBe('Initial Apartment Title');
    expect(wrapper.vm.description).toBe('Initial Apartment Description');
    expect(wrapper.vm.livingSpace).toBe(100);
    expect(wrapper.vm.usableSpace).toBe(80);
    expect(wrapper.vm.heatingSpace).toBe(60);
    expect(wrapper.vm.location).toBe('Initial Location');
  });

  it('validates living space is positive', async () => {
    wrapper.vm.livingSpace = -10;
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.validationErrors).toContain('Wohnfläche darf nicht negativ sein.');
    expect(wrapper.vm.isValid).toBe(false);
  });

  it('validates usable space is positive', async () => {
    wrapper.vm.usableSpace = -5;
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.validationErrors).toContain('Nutzfläche darf nicht negativ sein.');
    expect(wrapper.vm.isValid).toBe(false);
  });

  it('validates heating space is positive', async () => {
    wrapper.vm.heatingSpace = -3;
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.validationErrors).toContain('Heizfläche darf nicht negativ sein.');
    expect(wrapper.vm.isValid).toBe(false);
  });
});
