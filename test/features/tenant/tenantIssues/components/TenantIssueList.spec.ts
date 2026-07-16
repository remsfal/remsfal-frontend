import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { issueService } from '@/services/IssueService';
import { tenancyService } from '@/services/TenancyService';
import Select from 'primevue/select';

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

    const { TenantIssueList } = await import('@/features/tenant/tenantIssues');
    const wrapper = mount(TenantIssueList);

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

  it('shows empty state when no issues are returned', async () => {
    vi.mocked(tenancyService.getTenancies).mockResolvedValue([]);
    vi.mocked(issueService.getIssues).mockResolvedValue({
      first: 0,
      size: 0,
      issues: [],
    });

    const { TenantIssueList } = await import('@/features/tenant/tenantIssues');
    const wrapper = mount(TenantIssueList);

    await flushPromises();

    expect(wrapper.findAll('[data-testid="tenant-issue-card"]')).toHaveLength(0);
    expect(wrapper.find('.pi.pi-inbox').exists()).toBe(true);
  });

  it('reloads issues when status filter changes', async () => {
    vi.mocked(tenancyService.getTenancies).mockResolvedValue([]);
    vi.mocked(issueService.getIssues)
      .mockResolvedValueOnce({
        first: 0,
        size: 0,
        issues: [],
      })
      .mockResolvedValueOnce({
        first: 0,
        size: 1,
        issues: [
          {
            id: 'issue-open',
            title: 'Tür klemmt',
            status: 'OPEN',
            type: 'DEFECT',
            createdAt: '2026-01-02T10:00:00.000Z',
            modifiedAt: '2026-01-03T10:00:00.000Z',
            tenancyId: 'agreement-1',
          },
        ],
      });

    const { TenantIssueList } = await import('@/features/tenant/tenantIssues');
    const wrapper = mount(TenantIssueList);

    await flushPromises();

    const selects = wrapper.findAllComponents(Select);
    await selects[1].vm.$emit('update:modelValue', 'OPEN');
    await flushPromises();

    expect(issueService.getIssues).toHaveBeenNthCalledWith(2, undefined, true, 'OPEN', undefined, undefined);
  });

  it('sorts issues by status when no status filter is active', async () => {
    vi.mocked(tenancyService.getTenancies).mockResolvedValue([]);
    vi.mocked(issueService.getIssues).mockResolvedValue({
      first: 0,
      size: 5,
      issues: [
        {
          id: 'issue-closed',
          title: 'Closed',
          status: 'CLOSED',
          type: 'TASK',
        },
        {
          id: 'issue-rejected',
          title: 'Rejected',
          status: 'REJECTED',
          type: 'TASK',
        },
        {
          id: 'issue-open',
          title: 'Open',
          status: 'OPEN',
          type: 'TASK',
        },
        {
          id: 'issue-in-progress',
          title: 'In Progress',
          status: 'IN_PROGRESS',
          type: 'TASK',
        },
        {
          id: 'issue-pending',
          title: 'Pending',
          status: 'PENDING',
          type: 'TASK',
        },
      ],
    });

    const { TenantIssueList } = await import('@/features/tenant/tenantIssues');
    const wrapper = mount(TenantIssueList);

    await flushPromises();

    const cardTexts = wrapper.findAll('[data-testid="tenant-issue-card"]').map((card) => card.text());
    expect(cardTexts).toHaveLength(5);
    expect(cardTexts[0]).toContain('Pending');
    expect(cardTexts[1]).toContain('Open');
    expect(cardTexts[2]).toContain('In Progress');
    expect(cardTexts[3]).toContain('Closed');
    expect(cardTexts[4]).toContain('Rejected');
  });

  it('filters issues by type on the client side', async () => {
    vi.mocked(tenancyService.getTenancies).mockResolvedValue([]);
    vi.mocked(issueService.getIssues).mockResolvedValue({
      first: 0,
      size: 3,
      issues: [
        {
          id: 'issue-defect',
          title: 'Defect issue',
          status: 'OPEN',
          type: 'DEFECT',
        },
        {
          id: 'issue-task',
          title: 'Task issue',
          status: 'OPEN',
          type: 'TASK',
        },
        {
          id: 'issue-maintenance',
          title: 'Maintenance issue',
          status: 'OPEN',
          type: 'MAINTENANCE',
        },
      ],
    });

    const { TenantIssueList } = await import('@/features/tenant/tenantIssues');
    const wrapper = mount(TenantIssueList);

    await flushPromises();

    const selects = wrapper.findAllComponents(Select);
    await selects[2].vm.$emit('update:modelValue', 'TASK');
    await flushPromises();

    const cardTexts = wrapper.findAll('[data-testid="tenant-issue-card"]').map((card) => card.text());
    expect(cardTexts).toHaveLength(1);
    expect(cardTexts[0]).toContain('Task issue');
  });

  it('filters issues by search query over title and id', async () => {
    vi.mocked(tenancyService.getTenancies).mockResolvedValue([]);
    vi.mocked(issueService.getIssues).mockResolvedValue({
      first: 0,
      size: 3,
      issues: [
        {
          id: 'ABC-123',
          title: 'Heizung kaputt',
          status: 'OPEN',
          type: 'DEFECT',
        },
        {
          id: 'DEF-456',
          title: 'Fenster defekt',
          status: 'OPEN',
          type: 'DEFECT',
        },
        {
          id: 'GHI-789',
          title: 'Wasserleck',
          status: 'OPEN',
          type: 'MAINTENANCE',
        },
      ],
    });

    const { TenantIssueList } = await import('@/features/tenant/tenantIssues');
    const wrapper = mount(TenantIssueList);

    await flushPromises();

    const searchInput = wrapper.get('input[type="text"]');

    await searchInput.setValue('HEIZUNG');
    await flushPromises();
    let cardTexts = wrapper.findAll('[data-testid="tenant-issue-card"]').map((card) => card.text());
    expect(cardTexts).toHaveLength(1);
    expect(cardTexts[0]).toContain('Heizung kaputt');

    await searchInput.setValue('def-456');
    await flushPromises();
    cardTexts = wrapper.findAll('[data-testid="tenant-issue-card"]').map((card) => card.text());
    expect(cardTexts).toHaveLength(1);
    expect(cardTexts[0]).toContain('Fenster defekt');
  });

  it('shows translated error and clears cards when issue loading fails', async () => {
    vi.mocked(tenancyService.getTenancies).mockResolvedValue([]);
    vi.mocked(issueService.getIssues).mockRejectedValue(new Error('request failed'));

    const { TenantIssueList } = await import('@/features/tenant/tenantIssues');
    const wrapper = mount(TenantIssueList);

    await flushPromises();

    expect(wrapper.text()).toContain('Fehler');
    expect(wrapper.findAll('[data-testid="tenant-issue-card"]')).toHaveLength(0);
  });
});
