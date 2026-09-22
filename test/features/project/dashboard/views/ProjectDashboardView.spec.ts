import {describe, it, expect, vi, beforeEach} from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { ProjectDashboardView } from '@/features/project/dashboard';
import Card from 'primevue/card';
import Chart from 'primevue/chart';
import { propertyService } from '@/features/project/rentableUnits/services/PropertyService';
import { issueService, type IssueItemJson } from '@/features/project/issues/services/IssueService';
import { useUserSessionStore } from '@/stores/UserSession';

const push = vi.fn();
vi.mock('vue-router', () => ({useRoute: () => ({params: {projectId: '1',},}), useRouter: () => ({ push }),}));
vi.mock('@/features/project/rentableUnits/services/PropertyService');

vi.mock('@/features/project/issues/services/IssueService', async () => {
  const actual = await vi.importActual<
    typeof import('@/features/project/issues/services/IssueService')
      >('@/features/project/issues/services/IssueService');
  return {
    ...actual,
    issueService: { getIssues: vi.fn() },
  };
});

function issue(overrides: Partial<IssueItemJson>): IssueItemJson {
  return {
    id: 'id', title: 'title', status: 'OPEN', priority: 'MEDIUM', type: 'DEFECT',
    modifiedAt: '2024-01-01T00:00:00Z', ...overrides,
  };
}

describe('ProjectDashboardView.vue', () => {
  let sessionStore: ReturnType<typeof useUserSessionStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({ properties: [] });
    vi.mocked(issueService.getIssues).mockResolvedValue({ size: 0, issues: [] });
    sessionStore = useUserSessionStore();
    sessionStore.user = { id: 'me' } as ReturnType<typeof useUserSessionStore>['user'];
  });

  it('renders the dashboard page with correct translation', async () => {
    const wrapper = mount(ProjectDashboardView, {
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
    const wrapper = mount(ProjectDashboardView, {
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

    const wrapper = mount(ProjectDashboardView, {
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

  it('fetches open issues scoped to me and recent pending issues project-wide with limit 5', async () => {
    const wrapper = mount(ProjectDashboardView, { global: { components: { Card, Chart } } });
    await flushPromises();

    expect(issueService.getIssues).toHaveBeenCalledWith('1', ['PENDING', 'OPEN', 'IN_PROGRESS'], undefined, 'me');
    expect(issueService.getIssues).toHaveBeenCalledWith(
      '1', 'PENDING', undefined, undefined, undefined, undefined, undefined, undefined, 5,
    );
    expect(wrapper.exists()).toBe(true);
  });

  it('shows the top 5 my-task issues by priority with title and type label', async () => {
    vi.mocked(issueService.getIssues).mockImplementation(async (_projectId, status) => {
      if (!Array.isArray(status)) return { size: 0, issues: [] };
      return {
        size: 6,
        issues: [
          issue({
            id: 'low', title: 'Low prio', priority: 'LOW' 
          }),
          issue({
            id: 'urgent', title: 'Urgent one', priority: 'URGENT', type: 'DEFECT' 
          }),
          issue({
            id: 'unclassified', title: 'No prio', priority: undefined 
          }),
          issue({
            id: 'high1', title: 'High one', priority: 'HIGH' 
          }),
          issue({
            id: 'medium', title: 'Medium one', priority: 'MEDIUM' 
          }),
          issue({
            id: 'high2', title: 'High two', priority: 'HIGH' 
          }),
        ],
      };
    });

    const wrapper = mount(ProjectDashboardView, { global: { components: { Card, Chart } } });
    await flushPromises();

    const rows = wrapper.findAll('[data-testid="project-dashboard-mytasks-row"]');
    expect(rows).toHaveLength(5);
    expect(rows[0]!.text()).toContain('Urgent one');
    expect(rows[0]!.text()).toContain('Mangel');
  });

  it('shows the latest pending reports in the order returned by the backend', async () => {
    vi.mocked(issueService.getIssues).mockImplementation(async (_projectId, status) => {
      if (Array.isArray(status)) return { size: 0, issues: [] };
      return {
        size: 3,
        issues: [
          issue({
            id: 'newest', title: 'Newest', type: 'MAINTENANCE' 
          }),
          issue({ id: 'mid', title: 'Mid' }),
          issue({ id: 'old', title: 'Old' }),
        ],
      };
    });

    const wrapper = mount(ProjectDashboardView, { global: { components: { Card, Chart } } });
    await flushPromises();

    const rows = wrapper.findAll('[data-testid="project-dashboard-latestreports-row"]');
    expect(rows).toHaveLength(3);
    expect(rows[0]!.text()).toContain('Newest');
    expect(rows[2]!.text()).toContain('Old');
  });

  it('shows the empty state for both issue cards when there are no issues', async () => {
    const wrapper = mount(ProjectDashboardView, { global: { components: { Card, Chart } } });
    await flushPromises();

    const text = wrapper.text().replace(/\s+/g, ' ');
    expect(text).toContain('Keine aktiven Aufgaben.');
    expect(wrapper.findAll('[data-testid="project-dashboard-mytasks-row"]')).toHaveLength(0);
    expect(wrapper.findAll('[data-testid="project-dashboard-latestreports-row"]')).toHaveLength(0);
  });

  it('navigates to the issue details page when a my-task row is clicked', async () => {
    vi.mocked(issueService.getIssues).mockImplementation(async (_projectId, status) => {
      if (!Array.isArray(status)) return { size: 0, issues: [] };
      return { size: 1, issues: [issue({ id: 'clickable' })] };
    });

    const wrapper = mount(ProjectDashboardView, { global: { components: { Card, Chart } } });
    await flushPromises();

    await wrapper.find('[data-testid="project-dashboard-mytasks-row"]').trigger('click');

    expect(push).toHaveBeenCalledWith({ name: 'IssueDetails', params: { projectId: '1', issueId: 'clickable' } });
  });
});
