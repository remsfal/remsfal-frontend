import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { issueService } from '@/services/IssueService';
import { tenancyService } from '@/services/TenancyService';

const pushMock = vi.fn();

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router');
  return {
    ...actual,
    useRouter: () => ({ push: pushMock }),
  };
});

vi.mock('@/services/TenancyService', async () => {
  const actual = await vi.importActual<typeof import('@/services/TenancyService')>(
    '@/services/TenancyService',
  );

  return {
    ...actual,
    tenancyService: { getTenancies: vi.fn() },
  };
});

vi.mock('@/services/IssueService', async () => {
  const actual = await vi.importActual<typeof import('@/services/IssueService')>(
    '@/services/IssueService',
  );

  return {
    ...actual,
    issueService: {
      getIssues: vi.fn(),
      getIssue: vi.fn(),
    },
  };
});

describe('TenantIssueList feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders issue cards and navigates to tenant issue details on click', async () => {
    vi.mocked(tenancyService.getTenancies).mockResolvedValue([
      {
        agreementId: 'agreement-1',
        rentalUnits: [
          {
            id: 'unit-1',
            type: 'APARTMENT',
            title: 'Wohnung 1',
            location: 'Musterstraße 1',
          },
        ],
      },
    ]);

    vi.mocked(issueService.getIssues).mockResolvedValue({
      first: 0,
      size: 1,
      issues: [
        {
          id: 'issue-1',
          title: 'Heizung defekt',
          status: 'OPEN',
          type: 'DEFECT',
          createdAt: '2026-01-02T10:00:00.000Z',
          modifiedAt: '2026-01-03T10:00:00.000Z',
          tenancyId: 'agreement-1',
        },
      ],
    });

    const { default: TenantIssueList } = await import(
      '@/features/tenant/tenantIssues/components/TenantIssueList.vue'
    );
    const wrapper = mount(TenantIssueList, { global: { stubs: { NewTenancyIssueDialog: true } } });

    await flushPromises();

    expect(wrapper.text()).toContain('Heizung defekt');
    const cards = wrapper.findAll('[data-testid="tenant-issue-card"]');
    expect(cards).toHaveLength(1);

    await cards[0].trigger('click');

    expect(pushMock).toHaveBeenCalledWith({
      name: 'TenantIssueDetails',
      params: { issueId: 'issue-1' },
    });
  });
});
