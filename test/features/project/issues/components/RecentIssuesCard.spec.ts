import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecentIssuesCard from '@/features/project/issues/components/RecentIssuesCard.vue';
import { issueService, type IssueItemJson } from '@/features/project/issues/services/IssueService';
import { useProjectStore } from '@/stores/ProjectStore';

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

function issue(overrides: Partial<IssueItemJson>): IssueItemJson {
  return {
    id: 'id', projectId: 'p1', title: 'title', status: 'OPEN', priority: 'MEDIUM', type: 'DEFECT',
    modifiedAt: '2024-01-01T00:00:00Z', ...overrides,
  };
}

describe('RecentIssuesCard', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(issueService.getLatestIssues).mockResolvedValue({ size: 0, issues: [] });
  });

  it('requests the 5 latest issues across all projects', async () => {
    wrapper = mount(RecentIssuesCard);
    await flushPromises();

    expect(issueService.getLatestIssues).toHaveBeenCalledWith(5);
  });

  it('shows the issues in the order returned by the backend with type label and project name', async () => {
    const projectStore = useProjectStore();
    projectStore.projects = [{
      id: 'p1', name: 'Haus A', memberRole: 'MANAGER' 
    }];
    vi.mocked(issueService.getLatestIssues).mockResolvedValue({
      size: 2,
      issues: [
        issue({
          id: 'newest', title: 'Newest', type: 'MAINTENANCE', projectId: 'p1' 
        }),
        issue({
          id: 'older', title: 'Older', projectId: 'unknown' 
        }),
      ],
    });

    wrapper = mount(RecentIssuesCard);
    await flushPromises();

    const rows = wrapper.findAll('[data-testid="recent-issues-row"]');
    expect(rows).toHaveLength(2);
    expect(rows[0]!.text()).toContain('Newest');
    expect(rows[0]!.text()).toContain('issueType.maintenance');
    expect(rows[0]!.text()).toContain('Haus A');
    expect(rows[1]!.text()).toContain('Older');
  });

  it('shows the empty state when there are no issues', async () => {
    wrapper = mount(RecentIssuesCard);
    await flushPromises();

    expect(wrapper.text()).toContain('issueDashboard.empty');
    expect(wrapper.findAll('[data-testid="recent-issues-row"]')).toHaveLength(0);
  });

  it('falls back to the empty state when loading fails', async () => {
    vi.mocked(issueService.getLatestIssues).mockRejectedValue(new Error('boom'));

    wrapper = mount(RecentIssuesCard);
    await flushPromises();

    expect(wrapper.text()).toContain('issueDashboard.empty');
  });

  it('navigates to the issue of the correct project when a row is selected', async () => {
    vi.mocked(issueService.getLatestIssues).mockResolvedValue({
      size: 1,
      issues: [issue({ id: 'i1', projectId: 'p2' })],
    });

    wrapper = mount(RecentIssuesCard);
    await flushPromises();
    await wrapper.find('[data-testid="recent-issues-row"]').trigger('click');

    expect(push).toHaveBeenCalledWith({ name: 'IssueDetails', params: { projectId: 'p2', issueId: 'i1' } });
  });
});
