import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ModifyPropertyView from '../../src/views/ModifyPropertyView.vue';
import PrimeVue from 'primevue/config';
import { createRouter, createWebHistory } from 'vue-router';
import ProjectService from '../../src/services/ProjectService';

describe('ModifyPropertyView', () => {
    let wrapper;
    let router;

    beforeEach(async () => {
        vi.spyOn(ProjectService.prototype, 'getProperty').mockResolvedValue({
            id: '1',
            title: 'Test Property',
            description: 'Test Description',
            district: 'Test District',
            corridor: 'Test Corridor',
            parcel: 'Test Parcel',
            landRegistry: 'Test LandRegistry',
            usageType: 'GF',
        });

        vi.spyOn(ProjectService.prototype, 'updateProperty').mockResolvedValue({});
        vi.spyOn(window, 'alert').mockImplementation(() => {});

        router = createRouter({
            history: createWebHistory(),
            routes: [
                {
                    path: '/project/:projectId/objects',
                    name: 'objects',
                    component: { template: '<div>Objects</div>' },
                },
            ],
        });


        router.push({ path: '/', query: { propertyId: '1' } });
        await router.isReady();

        wrapper = mount(ModifyPropertyView, {
            props: { projectId: '1' },
            global: {
                plugins: [PrimeVue, router],
            },
        });

        await flushPromises(); // Warten auf asynchrone Vorgänge
    });

    it('renders the property details', async () => {
        const titleInput = wrapper.find('#title');
        const descriptionTextarea = wrapper.find('#description');
        const districtInput = wrapper.find('#district');
        const corridorInput = wrapper.find('#corridor');
        const parcelInput = wrapper.find('#parcel');
        const landRegistryInput = wrapper.find('#landRegistry');
        const usageTypeDropdown = wrapper.find('#usageType');

        expect(titleInput.exists()).toBe(true);
        expect(descriptionTextarea.exists()).toBe(true);
        expect(districtInput.exists()).toBe(true);
        expect(corridorInput.exists()).toBe(true);
        expect(parcelInput.exists()).toBe(true);
        expect(landRegistryInput.exists()).toBe(true);
        expect(usageTypeDropdown.exists()).toBe(true);

        expect(titleInput.element.value).toBe('Test Property');
        expect(descriptionTextarea.element.value).toBe('Test Description');
        expect(districtInput.element.value).toBe('Test District');
        expect(corridorInput.element.value).toBe('Test Corridor');
        expect(parcelInput.element.value).toBe('Test Parcel');
        expect(landRegistryInput.element.value).toBe('Test LandRegistry');
    });

    it('updates the property when the save button is clicked', async () => {
        const updateSpy = vi.spyOn(ProjectService.prototype, 'updateProperty');
        const pushSpy = vi.spyOn(router, 'push');

        const saveButton = wrapper.find('.p-button.mr-2');
        await saveButton.trigger('click');
        await flushPromises();

        expect(updateSpy).toHaveBeenCalledWith('1', '1', expect.objectContaining({
            title: 'Test Property',
            description: 'Test Description',
            district: 'Test District',
            corridor: 'Test Corridor',
            parcel: 'Test Parcel',
            landRegistry: 'Test LandRegistry',
            usageType: 'GF',
            landRegisterEntry: '',
            plotArea: 0,
            effective_space: 0,
        }));
        expect(pushSpy).toHaveBeenCalledWith('/project/1/objects');
    });

    it('navigates to objects when the cancel button is clicked', async () => {
        const pushSpy = vi.spyOn(router, 'push');

        const cancelButton = wrapper.find('.p-button.p-button-secondary');
        await cancelButton.trigger('click');

        expect(pushSpy).toHaveBeenCalledWith('/project/1/objects');
    });

    it('fetches property details on mount', async () => {
        const getPropertySpy = vi.spyOn(ProjectService.prototype, 'getProperty').mockResolvedValue({
            id: '1',
            title: 'Test Property',
            // ... weitere Felder
        });


        wrapper = mount(ModifyPropertyView, {
            props: { projectId: '1' },
            global: {
                plugins: [PrimeVue, router],
            },
        });

        await flushPromises();

        expect(getPropertySpy).toHaveBeenCalledWith('1', '1');
    });
});
