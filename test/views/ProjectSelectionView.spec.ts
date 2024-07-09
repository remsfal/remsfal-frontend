import { mount, shallowMount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ProjectSelectionView from '@/views/ProjectSelectionView.vue';
import ProjectService from '@/services/ProjectService';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/ProjectStore';
import { nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('@/services/ProjectService');
vi.mock('vue-router', () => ({
    useRouter: vi.fn()
}));
vi.mock('@/stores/ProjectStore', () => ({
    useProjectStore: vi.fn()
}));
vi.mock('primevue/datatable', () => ({
    DataTable: {
        name: 'DataTable',
        template: '<div><slot /></div>'
    }
}));
vi.mock('primevue/column', () => ({
    Column: {
        name: 'Column',
        template: '<div><slot /></div>'
    }
}));
vi.mock('primevue/button', () => ({
    Button: {
        name: 'Button',
        template: '<button><slot /></button>'
    }
}));
vi.mock('primevue/dialog', () => ({
    Dialog: {
        name: 'Dialog',
        template: '<div><slot /></div>'
    }
}));

describe('ProjectSelectionView.vue', () => {
    let wrapper: VueWrapper<any>;

    beforeEach(() => {
        // Create and set Pinia instance
        const pinia = createPinia();
        setActivePinia(pinia);

        // Mock implementations
        ProjectService.mockImplementation(() => ({
            getProjects: vi.fn().mockResolvedValue({ projects: [], total: 0 })
        }));

        useRouter.mockReturnValue({
            push: vi.fn()
        });

        useProjectStore.mockReturnValue({
            setSelectedProject: vi.fn(),
            projectId: '123'
        });

        // Mount the component with Pinia
        wrapper = shallowMount(ProjectSelectionView, {
            global: {
                plugins: [pinia]
            }
        });
    });

    it('renders the view', () => {
        expect(wrapper.exists()).toBe(true);
        expect(wrapper.find('h5').text()).toBe('Projekt Übersicht');
    });

    it('loads data on mounted', async () => {
        await nextTick();
        expect(wrapper.vm.loading).toBe(false);
        expect(wrapper.vm.projects).toEqual([]);
        expect(wrapper.vm.totalRecords).toBe(0);
    });

    it('opens and closes the dialog', async () => {
        expect(wrapper.vm.display).toBe(false);
        wrapper.vm.open();
        await nextTick();
        expect(wrapper.vm.display).toBe(true);
        wrapper.vm.close();
        await nextTick();
        expect(wrapper.vm.display).toBe(false);
    });

    it('handles row click', async () => {
        const event = { data: { id: 1, name: 'Test Project' } };
        await wrapper.vm.onRowClick(event);
        const projectStore = useProjectStore();
        expect(projectStore.setSelectedProject).toHaveBeenCalledWith(event.data);
        const router = useRouter();
        expect(router.push).toHaveBeenCalledWith({ name: 'ProjectDashboard', params: { projectId: '123' } });
    });

    it('handles pagination', async () => {
        const event = { first: 10, rows: 10 };
        await wrapper.vm.onPage(event);
        expect(wrapper.vm.lazyParams).toEqual(event);
    });

    it('loads lazy data', async () => {
        const event = { first: 20, rows: 10 };
        await wrapper.vm.loadLazyData(event);
        await nextTick();
        expect(wrapper.vm.loading).toBe(false);
        expect(wrapper.vm.projects).toEqual([]);
        expect(wrapper.vm.totalRecords).toBe(0);
        expect(wrapper.vm.lazyParams).toEqual(event);
    });

});