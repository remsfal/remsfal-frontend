import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Component from '@/components/NewProjectForm.vue'; // Update the import path to the correct path for your component

describe('Component', () => {
    test('renders NewProjectForm properly', () => {
        const wrapper = mount(Component);
        expect(wrapper.findComponent({ name: 'NewProjectForm' }).exists())
    });
});

