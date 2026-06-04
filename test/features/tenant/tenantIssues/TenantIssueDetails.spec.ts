import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { issueService } from '@/services/IssueService';

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

describe('TenantIssueDetails feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    const { default: TenantIssueDetails } = await import('@/features/tenant/tenantIssues/TenantIssueDetails.vue');
    const wrapper = mount(TenantIssueDetails, { props: { issueId: 'issue-42' } });

    await flushPromises();

    expect(issueService.getIssue).toHaveBeenCalledWith('issue-42');
    expect(wrapper.text()).toContain('Wasserschaden Küche');
    expect(wrapper.find('[data-testid="tenant-issue-timeline-placeholder"]').exists()).toBe(true);
  });
});
