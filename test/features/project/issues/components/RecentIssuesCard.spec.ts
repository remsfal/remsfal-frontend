import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecentIssuesCard from '@/features/project/issues/components/RecentIssuesCard.vue';
import { issueService, type IssueItemJson } from '@/features/project/issues/services/IssueService';
import { useProjectStore } from '@/stores/ProjectStore';
import type { ProjectItem } from '@/services/ProjectService';

const push = vi.fn();
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }));

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

vi.mock('@/features/project/issues/services/IssueService', async () => {
  const actual = await vi.importActual<
    typeof import('@/features/project/issues/services/IssueService')
      >('@/features/project/issues/services/IssueService');
  return {
    ...actual,
    issueService: { getLatestIssues: vi.fn() },
  };
});

vi.mock('@/stores/ProjectStore', () => ({ useProjectStore: vi.fn() }));

function issue(overrides: Partial<IssueItemJson>): IssueItemJson {
  return {
    id: 'id', title: 'title', status: 'OPEN', priority: 'MEDIUM', type: 'DEFECT', projectId: 'p1',
    modifiedAt: '2024-01-01T00:00:00Z', ...overrides,
  };
}

describe('RecentIssuesCard', () => {
  let wrapper: VueWrapper;
  let refreshProjectListMock: ReturnType<typeof vi.fn>;

  function mockProjectStore(projectList: ProjectItem[]) {
    refreshProjectListMock = vi.fn().mockResolvedValue(undefined);
    (useProjectStore as unknown as () => { projectList: ProjectItem[]; refreshProjectList: typeof refreshProjectListMock }) =
      () => ({ projectList, refreshProjectList: refreshProjectListMock });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockProjectStore([{
      id: 'p1', name: 'Musterliegenschaft', memberRole: 'MANAGER' 
    }]);
    vi.mocked(issueService.getLatestIssues).mockResolvedValue({ size: 0, issues: [] });
  });

  it('fetches the 5 latest issues across all projects', async () => {
    wrapper = mount(RecentIssuesCard);
    await flushPromises();

    expect(issueService.getLatestIssues).toHaveBeenCalledWith();
    expect(refreshProjectListMock).toHaveBeenCalled();
  });

  it('shows the latest issues with title, type label and project name', async () => {
    vi.mocked(issueService.getLatestIssues).mockResolvedValue({
      size: 2,
      issues: [
        issue({
          id: 'newest', title: 'Newest', type: 'MAINTENANCE', projectId: 'p1',
        }),
        issue({
          id: 'older', title: 'Older', projectId: 'p1' 
        }),
      ],
    });

    wrapper = mount(RecentIssuesCard);
    await flushPromises();

    const rows = wrapper.findAll('[data-testid="recent-issues-row"]');
    expect(rows).toHaveLength(2);
    expect(rows[0]!.text()).toContain('Newest');
    expect(rows[0]!.text()).toContain('issueType.maintenance');
    expect(rows[0]!.text()).toContain('Musterliegenschaft');
  });

  it('shows the empty state when there are no issues', async () => {
    wrapper = mount(RecentIssuesCard);
    await flushPromises();

    expect(wrapper.text()).toContain('issueDashboard.empty');
    expect(wrapper.findAll('[data-testid="recent-issues-row"]')).toHaveLength(0);
  });

  it('shows loading skeletons while fetching', () => {
    vi.mocked(issueService.getLatestIssues).mockReturnValue(new Promise(() => {}));

    wrapper = mount(RecentIssuesCard);

    expect(wrapper.findComponent({ name: 'Skeleton' }).exists()).toBe(true);
  });

  it('logs an error and shows the empty state when fetching fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(issueService.getLatestIssues).mockRejectedValue(new Error('fail'));

    wrapper = mount(RecentIssuesCard);
    await flushPromises();

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(wrapper.findAll('[data-testid="recent-issues-row"]')).toHaveLength(0);
    consoleErrorSpy.mockRestore();
  });

  it('navigates to the issue details page when a row is clicked', async () => {
    vi.mocked(issueService.getLatestIssues).mockResolvedValue({
      size: 1,
      issues: [issue({ id: 'clickable', projectId: 'p1' })],
    });

    wrapper = mount(RecentIssuesCard);
    await flushPromises();

    await wrapper.find('[data-testid="recent-issues-row"]').trigger('click');

    expect(push).toHaveBeenCalledWith({ name: 'IssueDetails', params: { projectId: 'p1', issueId: 'clickable' } });
  });
});
