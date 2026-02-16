// tests/views/ProjectDashboard.spec.ts
import {describe, it, expect, vi} from 'vitest';
import { mount } from '@vue/test-utils';
import ProjectDashboard from '@/views/project/ProjectDashboard.vue';
import Card from 'primevue/card';
import Chart from 'primevue/chart';

vi.mock('vue-router', () => ({useRoute: () => ({params: {projectId: '1',},}),}));

describe('ProjectDashboard.vue', () => {
  it('renders the dashboard page with correct translation', () => {
    const wrapper = mount(ProjectDashboard, {
      global: {
        components: {
          Card,
          Chart,
        },
      },
    });

    const text = wrapper.text().replace(/\s+/g, ' ');
    expect(text).toContain('Dies ist die Projekt-Dashboard-Seite für Projekt 1');

    // Summary Cards Inhalte
    expect(text).toContain('Projekte');
    expect(text).toContain('6');
    expect(text).toContain('Offene Issues');
    expect(text).toContain('12');
    expect(text).toContain('Abgeschlossene Aufgaben');
    expect(text).toContain('34');

    // Aktivitäten prüfen
    expect(text).toContain('Dokumentation abgeschlossen');
    expect(text).toContain('Status geändert: "Review Meeting"');
    expect(text).toContain('Neuer Mangel gemeldet');

    // Tabellenüberschriften
    expect(text).toContain('Nächste Fälligkeiten');
    expect(text).toContain('Aufgabe');
    expect(text).toContain('Fällig am');
    expect(text).toContain('Status');

    expect(wrapper.findAllComponents(Chart).length).toBeGreaterThanOrEqual(4); 

  });

  it('renders the dashboard page with correct German translation', () => {
    const wrapper = mount(ProjectDashboard, {
      global: {
        components: {
          Card,
          Chart,
        },
      },
    });

    const text = wrapper.text().replace(/\s+/g, ' ');
    expect(text).toContain('Dies ist die Projekt-Dashboard-Seite für Projekt 1');
  });
});
