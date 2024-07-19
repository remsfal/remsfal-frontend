// tests/views/TaskView.spec.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TaskView from "../../src/views/TaskView.vue";

describe('TaskView.vue', () => {
    it('renders the task list header and project ID', () => {
        // Beispiel-Prop 'projectId'
        const projectId = '1';

        // Montieren der Komponente mit den Props
        const wrapper = mount(TaskView, {
            props: { projectId }
        });

        // Überprüfen, ob die Projekt-ID '1' korrekt angezeigt wird
        expect(wrapper.text()).toContain('Dies sind alle Aufgaben für das Projekt: 1');
    });
});
