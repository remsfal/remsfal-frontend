import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import CreatePropertyView from '../../src/views/CreatePropertyView.vue';
import PrimeVue from 'primevue/config';
import { createRouter, createWebHistory } from 'vue-router';
import ProjectService from '../../src/services/ProjectService';

describe('CreatePropertyView', () => {
    let wrapper;
    let router;

    beforeEach(async () => {
        vi.spyOn(window, 'alert').mockImplementation(() => {});
        vi.spyOn(ProjectService.prototype, 'createProperty').mockResolvedValue({});

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

        wrapper = mount(CreatePropertyView, {
            props: { projectId: '1' },
            global: {
                plugins: [PrimeVue, router],
            },
        });

        await router.isReady();
    });

    it('renders the title and description inputs', async () => {
        const titleInput = wrapper.find('.p-inputtext');
        const descriptionTextarea = wrapper.find('.p-textarea');

        expect(titleInput.exists()).toBe(true);
        expect(descriptionTextarea.exists()).toBe(true);
    });

    it('navigates to objects when the create button is clicked with valid input', async () => {
        const pushSpy = vi.spyOn(router, 'push');
        const titleInput = wrapper.find('#title');
        const createButton = wrapper.find('.p-button.mr-2');

        await titleInput.setValue('Test Title');
        await createButton.trigger('click');
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(pushSpy).toHaveBeenCalledWith('/project/1/objects');
    });

    it('does not navigate when the title is empty', async () => {
        const pushSpy = vi.spyOn(router, 'push');
        const createButton = wrapper.find('.p-button.mr-2');

        await createButton.trigger('click');

        expect(pushSpy).not.toHaveBeenCalled();
    });

    it('navigates to objects when the cancel button is clicked', async () => {
        const pushSpy = vi.spyOn(router, 'push');
        const cancelButton = wrapper.find('.p-button.p-button-secondary');

        await cancelButton.trigger('click');

        expect(pushSpy).toHaveBeenCalledWith('/project/1/objects');
    });
});
