// tests/views/TaskView.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import TaskView from '../../src/views/TaskView.vue';
import PrimeVue from 'primevue/config';

describe('TaskView', () => {
  const projectId = '1';
  let wrapper: VueWrapper<TaskView>;

  beforeEach(() => {
    // Montieren der Komponente mit den Props
    wrapper = mount(TaskView, {
      props: { projectId },
      global: {
        plugins: [PrimeVue],
      },
    });
  });

  it('renders the task list header and project ID', () => {
    // Überprüfen, ob die Projekt-ID '1' korrekt angezeigt wird
    expect(wrapper.text()).toContain('Dies sind alle Aufgaben für das Projekt: 1');
  });
});
