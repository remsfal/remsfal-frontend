// /test/views/ProjectSettings.spec.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ProjectSettings from '../../src/views/ProjectSettings.vue';

describe('ProjectSettings.vue', () => {
  it('renders the project settings header and project ID', () => {
    // Beispiel-Prop 'projectId'
    const projectId = '1';

    // Montieren der Komponente mit den Props
    const wrapper = mount(ProjectSettings, {
      props: { projectId },
    });

    // Überprüfen, ob die Projekt-ID '1' korrekt angezeigt wird
    expect(wrapper.text()).toContain('This is the project settings page for project 1');
  });
});
