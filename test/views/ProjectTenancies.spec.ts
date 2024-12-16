import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { vi } from 'vitest';
import ProjectTenancies from '@/views/ProjectTenancies.vue';
import PrimeVue from 'primevue/config';
import Dialog from 'primevue/dialog';

// Mock PrimeVue configuration and Dialog component to avoid errors during testing
vi.mock('primevue/config', () => ({
    default: {
        install: () => {},
        locale: 'en',
    },
}));

vi.mock('primevue/dialog', () => ({
    default: {
        inheritAttrs: false,  // Prevents the passing of extraneous attributes to the root element
        render: () => '<div class="mock-dialog"></div>', // Mock rendering
    },
}));

describe('ProjectTenancies.vue', () => {
    let wrapper: any;

    beforeEach(() => {
        // Mount the component with PrimeVue plugin and Dialog component mocked
        wrapper = mount(ProjectTenancies, {
            global: {
                plugins: [PrimeVue],
                components: {
                    Dialog,
                },
            },
        });
    });


    it('renders correctly', () => {
        expect(wrapper.exists()).toBe(true);
    });

    it('opens add dialog when button is clicked', async () => {
        // Directly call the openAddDialog method
        await wrapper.vm.openAddDialog();

        // Assert that the dialog is open
        expect(wrapper.vm.dialogVisible).toBe(true);
    });


    it('adds a new tenant', async () => {
        wrapper.vm.currentTenant.firstName = 'John';
        wrapper.vm.currentTenant.lastName = 'Doe';
        wrapper.vm.saveTenant();
        expect(wrapper.vm.tenantData).toContainEqual(
            expect.objectContaining({
                firstName: 'John',
                lastName: 'Doe',
            }),
        );
    });
});
