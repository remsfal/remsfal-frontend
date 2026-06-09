import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { issueService } from '@/services/IssueService';

const toastAddMock = vi.fn();

vi.mock('primevue/usetoast', () => ({useToast: () => ({ add: toastAddMock }),}));

vi.mock('@/services/IssueService', async () => {
  const actual = await vi.importActual<typeof import('@/services/IssueService')>(
    '@/services/IssueService',
  );

  return {
    ...actual,
    issueService: {
      getIssue: vi.fn(),
      getIssues: vi.fn(),
    },
  };
});

describe('TenantIssueDetails component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    toastAddMock.mockClear();
  });

  it('loads issue details and renders timeline placeholder', async () => {
    vi.mocked(issueService.getIssue).mockResolvedValue({
      id: 'issue-42',
      title: 'Wasserschaden Küche',
      status: 'IN_PROGRESS',
      type: 'DEFECT',
      agreementId: 'agreement-1',
      description: 'Rohr unter der Spüle undicht.',
    });

    const { default: TenantIssueDetails } = await import('@/features/tenant/tenantIssues/components/TenantIssueDetails.vue');
    const wrapper = mount(TenantIssueDetails, { props: { issueId: 'issue-42' } });

    await flushPromises();

    expect(issueService.getIssue).toHaveBeenCalledWith('issue-42');
    expect(wrapper.text()).toContain('Wasserschaden Küche');
    expect(wrapper.find('[data-testid="tenant-issue-timeline-placeholder"]').exists()).toBe(true);
  });

  it('reloads issue details when issueId prop changes', async () => {
    vi.mocked(issueService.getIssue)
      .mockResolvedValueOnce({
        id: 'issue-1',
        title: 'Heizung defekt',
        status: 'OPEN',
        type: 'DEFECT',
        agreementId: 'agreement-1',
        description: 'Die Heizung ist kalt.',
      })
      .mockResolvedValueOnce({
        id: 'issue-2',
        title: 'Wasserleck',
        status: 'IN_PROGRESS',
        type: 'MAINTENANCE',
        agreementId: 'agreement-1',
        description: 'Leck im Bad.',
      });

    const { default: TenantIssueDetails } = await import('@/features/tenant/tenantIssues/components/TenantIssueDetails.vue');
    const wrapper = mount(TenantIssueDetails, { props: { issueId: 'issue-1' } });

    await flushPromises();
    await wrapper.setProps({ issueId: 'issue-2' });
    await flushPromises();

    expect(issueService.getIssue).toHaveBeenNthCalledWith(1, 'issue-1');
    expect(issueService.getIssue).toHaveBeenNthCalledWith(2, 'issue-2');
    expect(wrapper.text()).toContain('Wasserleck');
  });

  it('shows toast when loading issue details fails', async () => {
    vi.mocked(issueService.getIssue).mockRejectedValue(new Error('request failed'));

    const { default: TenantIssueDetails } = await import('@/features/tenant/tenantIssues/components/TenantIssueDetails.vue');
    const wrapper = mount(TenantIssueDetails, { props: { issueId: 'issue-42' } });

    await flushPromises();

    expect(issueService.getIssue).toHaveBeenCalledWith('issue-42');
    expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    expect(wrapper.find('[data-testid="tenant-issue-timeline-placeholder"]').exists()).toBe(false);
  });
});
