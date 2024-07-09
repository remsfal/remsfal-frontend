import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import ProjectForm from '@/components/NewProjectForm.vue'; // update the path accordingly
import ProjectService from '@/services/ProjectService.ts';
import { useProjectStore } from '@/stores/ProjectStore';

vi.mock('@/services/ProjectService', () => ({
    default: vi.fn().mockImplementation(() => ({
        createProject: vi.fn().mockResolvedValue({ id: 1, title: 'New Project' })
    }))
}));

const router = createRouter({
    history: createMemoryHistory(),
    routes: [
        { path: '/projects', name: 'ProjectSelection', component: { template: '<div>Project Selection</div>' } },
        { path: '/project/:projectId', name: 'ProjectDashboard', component: { template: '<div>Project Dashboard</div>' } }
    ]
});

describe('ProjectForm.vue', () => {
    it('should render form correctly', () => {
        const wrapper = mount(ProjectForm, {
            global: {
                plugins: [router]
            }
        });

        expect(wrapper.find('form').exists()).toBe(true);
        expect(wrapper.find('label[for="value"]').exists()).toBe(true);
        expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
        expect(wrapper.find('button[type="reset"]').exists()).toBe(true);
    });

    it('should show error message if projectTitle exceeds maxLength', async () => {
        const wrapper = mount(ProjectForm, {
            global: {
                plugins: [router]
            }
        });

        await wrapper.setData({ projectTitle: 'a'.repeat(101) });
        expect(wrapper.find('.p-error').text()).toBe('Der Projekttitel darf nicht mehr als 100 Zeichen lang sein');
    });

    it('should call createProject and navigate to ProjectDashboard on valid submit', async () => {
        const wrapper = mount(ProjectForm, {
            global: {
                plugins: [router]
            }
        });

        await wrapper.setData({ projectTitle: 'Valid Project' });

        // Mock router push
        const pushSpy = vi.spyOn(wrapper.vm.$router, 'push');

        await wrapper.find('form').trigger('submit.prevent');

        expect(ProjectService.prototype.createProject).toHaveBeenCalledWith('Valid Project');
        expect(pushSpy).toHaveBeenCalledWith({
            name: 'ProjectDashboard',
            params: { projectId: 1 }
        });
    });

    it('should navigate to ProjectSelection on abort', async () => {
        const wrapper = mount(ProjectForm, {
            global: {
                plugins: [router]
            }
        });

        // Mock router push
        const pushSpy = vi.spyOn(wrapper.vm.$router, 'push');

        await wrapper.find('button[type="reset"]').trigger('click');

        expect(pushSpy).toHaveBeenCalledWith({ name: 'ProjectSelection' });
    });
});