import {flushPromises, mount, VueWrapper} from '@vue/test-utils';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import { server } from '../mocks/server';
import { handlers } from '../mocks/handlers';
import Component from '../../src/views/StorageView.vue';

// Centralized validation messages
const VALIDATION_MESSAGES = {
  title: 'Der Titel muss mindestens 3 Zeichen lang sein.',
  usableSpace: 'Nutzfläche darf nicht negativ sein.',
  description: 'Beschreibung darf maximal 500 Zeichen lang sein.',
};

// Mock vue-router
const mockPush = vi.fn();
vi.mock('vue-router', () => ({useRouter: () => ({push: mockPush,}),}));

// Register test-specific handlers with global server
beforeEach(() => server.use(...handlers));
afterEach(() => server.resetHandlers());

describe('StorageView.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(async () => {
    wrapper = mount(Component, {
      props: {
        projectId: 'project1',
        unitId: 'storage1',
      },
    });

    // wait for service call (getStorage) to resolve
    await flushPromises();
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

    expect(wrapper.vm.validationErrors).toContain(VALIDATION_MESSAGES.title);
    expect(wrapper.vm.validationErrors).toContain(VALIDATION_MESSAGES.usableSpace);
    expect(wrapper.vm.validationErrors).toContain(VALIDATION_MESSAGES.description);
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
    wrapper.vm.title = 'New Storage Title';
    wrapper.vm.description = 'Updated Description';
    wrapper.vm.usableSpace = 120;

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    // updated state comes from MSW PATCH response
    expect(wrapper.vm.title).toBe('New Storage Title');
    expect(wrapper.vm.description).toBe('Updated Description');
    expect(wrapper.vm.usableSpace).toBe(120);
  });

  it('validates that cancel button redirects to property list with correct route', async () => {
    mockPush.mockClear();
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
    expect(mockPush).toHaveBeenCalledWith({ 
      name: 'RentableUnits', 
      params: { projectId: 'project1' } 
    });

    confirmSpy.mockRestore();
  });

  it('redirects to correct storage view path after successful save', async () => {
    mockPush.mockClear();
    wrapper.vm.title = 'Updated Title';
    
    await wrapper.vm.save();
    await flushPromises();

    expect(mockPush).toHaveBeenCalledWith({ name: 'RentableUnits', params: { projectId: 'project1' } });
  });
});
