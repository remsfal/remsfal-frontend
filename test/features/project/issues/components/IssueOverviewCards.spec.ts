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

  it('shows the top 5 urgent issues by priority with title and priority label', async () => {
    vi.mocked(issueService.getIssues).mockResolvedValue({
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
    });

    wrapper = mount(IssueOverviewCards, { props: { projectId: '123' } });
    await flushPromises();

    const rows = wrapper.findAll('[data-testid="issue-overview-urgent-row"]');
    expect(rows).toHaveLength(5);
    expect(rows[0]!.text()).toContain('Urgent one');
    expect(rows[0]!.text()).toContain('issuePriority.urgent');
  });

  it('shows the top 5 recent issues assigned to me by modifiedAt with title and priority label', async () => {
    vi.mocked(issueService.getIssues).mockResolvedValue({
      size: 7,
      issues: [
        issue({
          id: 'old', title: 'Old', assigneeId: 'me', modifiedAt: '2024-01-01T00:00:00Z'
        }),
        issue({
          id: 'newest', title: 'Newest', assigneeId: 'me', modifiedAt: '2024-06-01T00:00:00Z', priority: 'HIGH'
        }),
        issue({
          id: 'mid1', title: 'Mid1', assigneeId: 'me', modifiedAt: '2024-03-01T00:00:00Z'
        }),
        issue({
          id: 'mid2', title: 'Mid2', assigneeId: 'me', modifiedAt: '2024-04-01T00:00:00Z'
        }),
        issue({
          id: 'mid3', title: 'Mid3', assigneeId: 'me', modifiedAt: '2024-05-01T00:00:00Z'
        }),
        issue({
          id: 'mid4', title: 'Mid4', assigneeId: 'me', modifiedAt: '2024-02-01T00:00:00Z'
        }),
        issue({
          id: 'other', title: 'Not mine', assigneeId: 'someone-else', modifiedAt: '2024-07-01T00:00:00Z'
        }),
      ],
    });

    wrapper = mount(IssueOverviewCards, { props: { projectId: '123' } });
    await flushPromises();

    const rows = wrapper.findAll('[data-testid="issue-overview-recent-row"]');
    expect(rows).toHaveLength(5);
    expect(rows[0]!.text()).toContain('Newest');
    expect(rows[0]!.text()).toContain('issuePriority.high');
    expect(rows.map((row) => row.text())).not.toContain(expect.stringContaining('Not mine'));
  });

  it('shows a toast and an empty state for both cards when the fetch fails', async () => {
    vi.mocked(issueService.getIssues).mockRejectedValue(new Error('fail'));

    wrapper = mount(IssueOverviewCards, { props: { projectId: '123' } });
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    expect(wrapper.findAll('[data-testid="issue-overview-urgent-row"]')).toHaveLength(0);
    expect(wrapper.findAll('[data-testid="issue-overview-recent-row"]')).toHaveLength(0);
  });

  it('renders fewer than 5 rows when fewer active issues exist', async () => {
    vi.mocked(issueService.getIssues).mockResolvedValue({size: 2, issues: [issue({ id: 'a' }), issue({ id: 'b' })],});

    wrapper = mount(IssueOverviewCards, { props: { projectId: '123' } });
    await flushPromises();

    expect(wrapper.findAll('[data-testid="issue-overview-urgent-row"]')).toHaveLength(2);
  });

  it('navigates to the issue details page when a row is clicked', async () => {
    vi.mocked(issueService.getIssues).mockResolvedValue({size: 1, issues: [issue({ id: 'clickable' })],});

    wrapper = mount(IssueOverviewCards, { props: { projectId: '123' } });
    await flushPromises();

    await wrapper.find('[data-testid="issue-overview-urgent-row"]').trigger('click');

    expect(push).toHaveBeenCalledWith({name: 'IssueDetails', params: { projectId: '123', issueId: 'clickable' },});
  });
});
