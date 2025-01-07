// tests/views/TaskView.spec.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ProjectDashboard from '../../src/views/ProjectDashboard.vue';
import i18n from '../../src/i18n/i18n';

describe('ProjectDashboard.vue', () => {
  it('view dashboard for project ID', () => {
    // Beispiel-Prop 'projectId'
    const projectId = '1';
    const projectTitle = 'Projekt Titel';

    // Montieren der Komponente mit den Props
    const wrapper = mount(ProjectDashboard, {
      global: {
        plugins: [i18n],
      },
      props: { projectId, projectTitle },
    });

    // Überprüfen, ob die Projekt-ID '1' korrekt angezeigt wird
    expect(wrapper.text()).toContain('This is the project dashboard page for project 1');
  });
});
