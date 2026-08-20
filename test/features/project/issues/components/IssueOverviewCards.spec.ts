import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import IssueOverviewCards from '@/features/project/issues/components/IssueOverviewCards.vue';
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
    id: 'id', title: 'title', status: 'OPEN', priority: 'MEDIUM', modifiedAt: '2024-01-01T00:00:00Z', ...overrides,
  };
}

describe('IssueOverviewCards', () => {
  let wrapper: VueWrapper;
  let sessionStore: ReturnType<typeof useUserSessionStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStore = useUserSessionStore();
    sessionStore.user = { id: 'me' } as ReturnType<typeof useUserSessionStore>['user'];
    vi.mocked(issueService.getIssues).mockResolvedValue({ size: 0, issues: [] });
  });

  it('fetches open issues project-wide and active recent issues scoped to me with limit 5', async () => {
    wrapper = mount(IssueOverviewCards, { props: { projectId: '123' } });
    await flushPromises();

    expect(issueService.getIssues).toHaveBeenCalledWith('123', ['OPEN', 'IN_PROGRESS']);
    expect(issueService.getIssues).toHaveBeenCalledWith(
      '123', ['PENDING', 'OPEN', 'IN_PROGRESS'], undefined, 'me', undefined, undefined, undefined, undefined, 5,
    );
  });

  it('shows the top 5 urgent issues by priority with title and priority label', async () => {
    vi.mocked(issueService.getIssues).mockImplementation(async (_projectId, _status, _type, assigneeId) => {
      if (assigneeId) return { size: 0, issues: [] };
      return {
        size: 6,
        issues: [
          issue({
            id: 'low', title: 'Low prio', priority: 'LOW'
          }),
          issue({
            id: 'urgent', title: 'Urgent one', priority: 'URGENT'
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

    wrapper = mount(IssueOverviewCards, { props: { projectId: '123' } });
    await flushPromises();

    const rows = wrapper.findAll('[data-testid="issue-overview-urgent-row"]');
    expect(rows).toHaveLength(5);
    expect(rows[0]!.text()).toContain('Urgent one');
    expect(rows[0]!.text()).toContain('issuePriority.urgent');
  });

  it('shows the recent issues assigned to me in the order returned by the backend', async () => {
    vi.mocked(issueService.getIssues).mockImplementation(async (_projectId, _status, _type, assigneeId) => {
      if (!assigneeId) return { size: 0, issues: [] };
      return {
        size: 3,
        issues: [
          issue({
            id: 'newest', title: 'Newest', priority: 'HIGH'
          }),
          issue({ id: 'mid', title: 'Mid' }),
          issue({ id: 'old', title: 'Old' }),
        ],
      };
    });

    wrapper = mount(IssueOverviewCards, { props: { projectId: '123' } });
    await flushPromises();

    const rows = wrapper.findAll('[data-testid="issue-overview-recent-row"]');
    expect(rows).toHaveLength(3);
    expect(rows[0]!.text()).toContain('Newest');
    expect(rows[0]!.text()).toContain('issuePriority.high');
    expect(rows[2]!.text()).toContain('Old');
  });

  it('shows an empty state for the recent card and skips the request when no user is logged in', async () => {
    sessionStore.user = null;
    vi.mocked(issueService.getIssues).mockResolvedValue({
      size: 1,
      issues: [issue({ id: 'u1' })],
    });

    wrapper = mount(IssueOverviewCards, { props: { projectId: '123' } });
    await flushPromises();

    expect(issueService.getIssues).toHaveBeenCalledTimes(1);
    expect(wrapper.findAll('[data-testid="issue-overview-recent-row"]')).toHaveLength(0);
    expect(wrapper.findAll('[data-testid="issue-overview-urgent-row"]')).toHaveLength(1);
  });

  it('shows loading skeletons while fetching', () => {
    vi.mocked(issueService.getIssues).mockReturnValue(new Promise(() => {}));

    wrapper = mount(IssueOverviewCards, { props: { projectId: '123' } });

    expect(wrapper.findComponent({ name: 'Skeleton' }).exists()).toBe(true);
  });

  it('shows a toast and an empty urgent card when only the urgent fetch fails, without affecting the recent card',
    async () => {
      vi.mocked(issueService.getIssues).mockImplementation(async (_projectId, _status, _type, assigneeId) => {
        if (assigneeId) return { size: 1, issues: [issue({ id: 'mine' })] };
        throw new Error('fail');
      });

      wrapper = mount(IssueOverviewCards, { props: { projectId: '123' } });
      await flushPromises();

      expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
      expect(wrapper.findAll('[data-testid="issue-overview-urgent-row"]')).toHaveLength(0);
      expect(wrapper.findAll('[data-testid="issue-overview-recent-row"]')).toHaveLength(1);
    });

  it('renders fewer than 5 rows when fewer active issues exist', async () => {
    vi.mocked(issueService.getIssues).mockImplementation(async (_projectId, _status, _type, assigneeId) => {
      if (assigneeId) return { size: 0, issues: [] };
      return { size: 2, issues: [issue({ id: 'a' }), issue({ id: 'b' })] };
    });

    wrapper = mount(IssueOverviewCards, { props: { projectId: '123' } });
    await flushPromises();

    expect(wrapper.findAll('[data-testid="issue-overview-urgent-row"]')).toHaveLength(2);
  });

  it('navigates to the issue details page when a row is clicked', async () => {
    vi.mocked(issueService.getIssues).mockImplementation(async (_projectId, _status, _type, assigneeId) => {
      if (assigneeId) return { size: 0, issues: [] };
      return { size: 1, issues: [issue({ id: 'clickable' })] };
    });

    wrapper = mount(IssueOverviewCards, { props: { projectId: '123' } });
    await flushPromises();

    await wrapper.find('[data-testid="issue-overview-urgent-row"]').trigger('click');

    expect(push).toHaveBeenCalledWith({name: 'IssueDetails', params: { projectId: '123', issueId: 'clickable' },});
  });
});
