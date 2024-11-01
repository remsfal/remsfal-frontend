import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ProjectView from '@/views/ProjectView.vue';

describe('ProjectView', () => {
    test('renders ProjectView properly with projectId', () => {
        const projectId = '12345'; // Example project ID
        const wrapper = mount(ProjectView, {
            props: {
                projectId,
            },
        });

        // Assert that the rendered text contains the projectId
        expect(wrapper.text()).toContain(`This is an my contacts page and config is ${projectId}.`);
    });
});