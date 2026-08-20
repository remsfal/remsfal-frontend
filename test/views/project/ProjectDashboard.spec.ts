// tests/views/ProjectDashboard.spec.ts
import {describe, it, expect, vi, beforeEach} from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import ProjectDashboard from '@/views/project/ProjectDashboard.vue';
import Card from 'primevue/card';
import Chart from 'primevue/chart';
import { propertyService } from '@/features/project/rentableUnits/services/PropertyService';

vi.mock('vue-router', () => ({useRoute: () => ({params: {projectId: '1',},}),}));
vi.mock('@/features/project/rentableUnits/services/PropertyService');

describe('ProjectDashboard.vue', () => {
  beforeEach(() => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({ properties: [] });
  });

  it('renders the dashboard page with correct translation', async () => {
    const wrapper = mount(ProjectDashboard, {
      global: {
        components: {
          Card,
          Chart,
        },
      },
    });
    await flushPromises();

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

  it('renders the dashboard page with correct German translation', async () => {
    const wrapper = mount(ProjectDashboard, {
      global: {
        components: {
          Card,
          Chart,
        },
      },
    });
    await flushPromises();

    const text = wrapper.text().replace(/\s+/g, ' ');
    expect(text).toContain('Dies ist die Projekt-Dashboard-Seite für Projekt 1');
  });

  it('shows and uses the scroll-to-top button after scrolling down', async () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      configurable: true,
      writable: true,
    });

    const wrapper = mount(ProjectDashboard, {
      global: {
        components: {
          Card,
          Chart,
        },
      },
    });

    await flushPromises();
    expect(wrapper.find('button[aria-label="Scroll to top"]').exists()).toBe(false);

    Object.defineProperty(window, 'scrollY', {
      value: 250,
      configurable: true,
      writable: true,
    });
    window.dispatchEvent(new Event('scroll'));
    await nextTick();

    const scrollTopButton = wrapper.find('button[aria-label="Scroll to top"]');
    expect(scrollTopButton.exists()).toBe(true);

    await scrollTopButton.trigger('click');
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
