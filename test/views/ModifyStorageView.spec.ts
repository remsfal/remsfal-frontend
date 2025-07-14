import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import Component from '../../src/views/ModifyStorageView.vue';
import { storageService } from '../../src/services/StorageService';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('../../src/services/StorageService', () => ({
  storageService: {
    getStorage: vi.fn(),
    updateStorage: vi.fn(),
  },
}));
describe('ModifyStorageView.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(async () => {
    (storageService.getStorage as Mock).mockResolvedValue({
      title: 'Initial Storage Title',
      description: 'Initial Storage Description',
      location: 'Initial Location',
      usableSpace: 100,
    });

    wrapper = mount(Component, {
      props: {
        projectId: 'project1',
        unitId: 'storage1',
      },
    });

    // wait for any onMounted async calls
    await wrapper.vm.$nextTick();
  });

  it('loads storage details on mount', () => {
    expect(wrapper.vm.title).toBe('Initial Storage Title');
    expect(wrapper.vm.description).toBe('Initial Storage Description');
    expect(wrapper.vm.location).toBe('Initial Location');
    expect(wrapper.vm.usableSpace).toBe(100);
  });

  it('validates title is not empty, usable space is positive and description does not exceed 500 char', async () => {
    wrapper.vm.title = '';
    wrapper.vm.usableSpace = -10;
    wrapper.vm.description = 'a'.repeat(501);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.validationErrors).toContain('Der Titel muss mindestens 3 Zeichen lang sein.');
    expect(wrapper.vm.validationErrors).toContain('Nutzfläche darf nicht negativ sein.');
    expect(wrapper.vm.validationErrors).toContain(
      'Beschreibung darf maximal 500 Zeichen lang sein.',
    );
    expect(wrapper.vm.isValid).toBe(false);
  });

  it('makes sure save button is enabled only if data is changed', async () => {
    const saveButton = wrapper.find('button[type="submit"]');
    expect((saveButton.element as HTMLButtonElement).disabled).toBe(true);
    await wrapper.find('input[type="text"]').setValue('New Storage Title');
    await wrapper.vm.$nextTick();
    expect((saveButton.element as HTMLButtonElement).disabled).toBe(false);
  });

  it('calls updateStorage service with correct data when saved', async () => {
    (storageService.updateStorage as Mock).mockResolvedValue({});

    // Werte ändern
    wrapper.vm.title = 'New Storage Title';
    wrapper.vm.description = 'Updated Description';
    wrapper.vm.usableSpace = 120;

    await wrapper.find('form').trigger('submit.prevent');

    expect(storageService.updateStorage).toHaveBeenCalledWith(
      'project1',
      'storage1',
      expect.objectContaining({
        title: 'New Storage Title',
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
