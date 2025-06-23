import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import Component from '../../src/views/ModifyGarageView.vue';
import { garageService } from '../../src/services/GarageService';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('../../src/services/GarageService', () => ({
  garageService: {
    getGarage: vi.fn(),
    updateGarage: vi.fn(),
  },
}));
describe('ModifyGarageView.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(async () => {
    (garageService.getGarage as Mock).mockResolvedValue({
      title: 'Initial Garage Title',
      description: 'Initial Garage Description',
      location: 'Initial Location',
      usableSpace: 100,
    });

    wrapper = mount(Component, {
      props: {
        projectId: 'project1',
        unitId: 'garage1',
      },
    });

    // wait for any onMounted async calls
    await wrapper.vm.$nextTick();
  });

  it('loads garage details on mount', () => {
    expect(wrapper.vm.title).toBe('Initial Garage Title');
    expect(wrapper.vm.description).toBe('Initial Garage Description');
    expect(wrapper.vm.location).toBe('Initial Location');
    expect(wrapper.vm.usableSpace).toBe(100);
  });

  it('validates usable space is positive', async () => {
    wrapper.vm.usableSpace = -10;
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.validationErrors).toContain('Nutzfläche darf nicht negativ sein.');
    expect(wrapper.vm.isValid).toBe(false);
  });

  it('validates title is not empty', async () => {
    wrapper.vm.title = '';
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.validationErrors).toContain('Der Titel muss mindestens 3 Zeichen lang sein.');
    expect(wrapper.vm.isValid).toBe(false);
  });

  it('validates description is not over 500 characters', async () => {
    wrapper.vm.description = 'a'.repeat(501);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.validationErrors).toContain(
      'Beschreibung darf maximal 500 Zeichen lang sein.',
    );
    expect(wrapper.vm.isValid).toBe(false);
  });

  it('makes sure save button is enabled only if data is changed', async () => {
    const saveButton = wrapper.find('button[type="submit"]');
    expect((saveButton.element as HTMLButtonElement).disabled).toBe(true);
    await wrapper.find('input[type="text"]').setValue('New Garage Title');
    await wrapper.vm.$nextTick();
    expect((saveButton.element as HTMLButtonElement).disabled).toBe(false);
  });

  it('calls updateGarage service with correct data when saved', async () => {
    (garageService.updateGarage as Mock).mockResolvedValue({});

    // Werte ändern
    wrapper.vm.title = 'New Garage Title';
    wrapper.vm.description = 'Updated Description';
    wrapper.vm.usableSpace = 120;

    await wrapper.find('form').trigger('submit.prevent');

    expect(garageService.updateGarage).toHaveBeenCalledWith(
      'project1',
      'garage1',
      expect.objectContaining({
        title: 'New Garage Title',
        description: 'Updated Description',
        location: 'Initial Location',
        usableSpace: 120,
      }),
    );
  });

  it('validates that cancel button redirects to property list with correct route', async () => {
    mockPush.mockClear(); // Reset vor jedem Test
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    wrapper = mount(Component, {
      props: {
        projectId: 'project1',
        unitId: 'unit1',
      },
    });

    await flushPromises();
    await wrapper.find('input[type="text"]').setValue('Geänderter Titel');
    const cancelBtn = wrapper.find('button[type="button"]');
    await cancelBtn.trigger('click');

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/project/project1/objects');

    confirmSpy.mockRestore();
  });
});
