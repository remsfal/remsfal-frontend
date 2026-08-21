import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import IssueDashboardCards from '@/features/project/issues/components/IssueDashboardCards.vue';
import { issueService, type IssueItemJson } from '@/services/IssueService';
import { useUserSessionStore } from '@/stores/UserSession';

const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

const push = vi.fn();
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }));

vi.mock('vue-i18n', () => ({useI18n: () => ({ t: (key: string) => key }),}));

vi.mock('@/services/IssueService', async () => {
  const actual = await vi.importActual<typeof import('@/services/IssueService')>('@/services/IssueService');
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

describe('IssueDashboardCards', () => {
  let wrapper: VueWrapper;
  let sessionStore: ReturnType<typeof useUserSessionStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStore = useUserSessionStore();
    sessionStore.user = { id: 'me' } as ReturnType<typeof useUserSessionStore>['user'];
    vi.mocked(issueService.getIssues).mockResolvedValue({ size: 0, issues: [] });
  });

  it('fetches open issues scoped to me and recent pending issues project-wide with limit 5', async () => {
    wrapper = mount(IssueDashboardCards, { props: { projectId: '123' } });
    await flushPromises();

    expect(issueService.getIssues).toHaveBeenCalledWith('123', ['PENDING', 'OPEN', 'IN_PROGRESS'], undefined, 'me');
    expect(issueService.getIssues).toHaveBeenCalledWith(
      '123', 'PENDING', undefined, undefined, undefined, undefined, undefined, undefined, 5,
    );
  });

  it('shows the top 5 urgent issues by priority with title and type label', async () => {
    vi.mocked(issueService.getIssues).mockImplementation(async (_projectId, status) => {
      if (!Array.isArray(status)) return { size: 0, issues: [] };
      return {
        size: 6,
        issues: [
          issue({
            id: 'low', title: 'Low prio', priority: 'LOW',
          }),
          issue({
            id: 'urgent', title: 'Urgent one', priority: 'URGENT', type: 'DEFECT',
          }),
          issue({
            id: 'unclassified', title: 'No prio', priority: undefined,
          }),
          issue({
            id: 'high1', title: 'High one', priority: 'HIGH',
          }),
          issue({
            id: 'medium', title: 'Medium one', priority: 'MEDIUM',
          }),
          issue({
            id: 'high2', title: 'High two', priority: 'HIGH',
          }),
        ],
      };
    });

    wrapper = mount(IssueDashboardCards, { props: { projectId: '123' } });
    await flushPromises();

    const rows = wrapper.findAll('[data-testid="issue-dashboard-urgent-row"]');
    expect(rows).toHaveLength(5);
    expect(rows[0]!.text()).toContain('Urgent one');
    expect(rows[0]!.text()).toContain('issueType.defect');
  });

  it('shows the recent pending issues in the order returned by the backend', async () => {
    vi.mocked(issueService.getIssues).mockImplementation(async (_projectId, status) => {
      if (Array.isArray(status)) return { size: 0, issues: [] };
      return {
        size: 3,
        issues: [
          issue({
            id: 'newest', title: 'Newest', type: 'MAINTENANCE',
          }),
          issue({ id: 'mid', title: 'Mid' }),
          issue({ id: 'old', title: 'Old' }),
        ],
      };
    });

    wrapper = mount(IssueDashboardCards, { props: { projectId: '123' } });
    await flushPromises();

    const rows = wrapper.findAll('[data-testid="issue-dashboard-recent-row"]');
    expect(rows).toHaveLength(3);
    expect(rows[0]!.text()).toContain('Newest');
    expect(rows[0]!.text()).toContain('issueType.maintenance');
    expect(rows[2]!.text()).toContain('Old');
  });

  it('still fetches recent issues and an unscoped urgent list when no user is logged in', async () => {
    sessionStore.user = null;
    vi.mocked(issueService.getIssues).mockResolvedValue({
      size: 1,
      issues: [issue({ id: 'u1' })],
    });

    wrapper = mount(IssueDashboardCards, { props: { projectId: '123' } });
    await flushPromises();

    expect(issueService.getIssues).toHaveBeenCalledTimes(2);
    expect(issueService.getIssues).toHaveBeenCalledWith('123', ['PENDING', 'OPEN', 'IN_PROGRESS'], undefined, undefined);
    expect(wrapper.findAll('[data-testid="issue-dashboard-recent-row"]')).toHaveLength(1);
    expect(wrapper.findAll('[data-testid="issue-dashboard-urgent-row"]')).toHaveLength(1);
  });

  it('shows loading skeletons while fetching', () => {
    vi.mocked(issueService.getIssues).mockReturnValue(new Promise(() => {}));

    wrapper = mount(IssueDashboardCards, { props: { projectId: '123' } });

    expect(wrapper.findComponent({ name: 'Skeleton' }).exists()).toBe(true);
  });

  it('shows a toast and an empty urgent card when only the urgent fetch fails, without affecting the recent card',
    async () => {
      vi.mocked(issueService.getIssues).mockImplementation(async (_projectId, status) => {
        if (!Array.isArray(status)) return { size: 1, issues: [issue({ id: 'mine' })] };
        throw new Error('fail');
      });

      wrapper = mount(IssueDashboardCards, { props: { projectId: '123' } });
      await flushPromises();

      expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
      expect(wrapper.findAll('[data-testid="issue-dashboard-urgent-row"]')).toHaveLength(0);
      expect(wrapper.findAll('[data-testid="issue-dashboard-recent-row"]')).toHaveLength(1);
    });

  it('renders fewer than 5 rows when fewer active issues exist', async () => {
    vi.mocked(issueService.getIssues).mockImplementation(async (_projectId, status) => {
      if (!Array.isArray(status)) return { size: 0, issues: [] };
      return { size: 2, issues: [issue({ id: 'a' }), issue({ id: 'b' })] };
    });

    wrapper = mount(IssueDashboardCards, { props: { projectId: '123' } });
    await flushPromises();

    expect(wrapper.findAll('[data-testid="issue-dashboard-urgent-row"]')).toHaveLength(2);
  });

  it('navigates to the issue details page when a row is clicked', async () => {
    vi.mocked(issueService.getIssues).mockImplementation(async (_projectId, status) => {
      if (!Array.isArray(status)) return { size: 0, issues: [] };
      return { size: 1, issues: [issue({ id: 'clickable' })] };
    });

    wrapper = mount(IssueDashboardCards, { props: { projectId: '123' } });
    await flushPromises();

    await wrapper.find('[data-testid="issue-dashboard-urgent-row"]').trigger('click');

    expect(push).toHaveBeenCalledWith({name: 'IssueDetails', params: { projectId: '123', issueId: 'clickable' },});
  });
});
