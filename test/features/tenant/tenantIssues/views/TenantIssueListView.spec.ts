import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { tenantIssueService } from '@/services/TenantIssueService';
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

vi.mock('@/services/TenantIssueService', async () => {
  const actual = await vi.importActual<typeof import('@/services/TenantIssueService')>(
    '@/services/TenantIssueService',
  );

  return {
    ...actual,
    tenantIssueService: {
      getIssues: vi.fn(),
      getIssue: vi.fn(),
    },
  };
});

describe('TenantIssueListView', () => {
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

    vi.mocked(tenantIssueService.getIssues).mockResolvedValue({
      size: 1,
      issues: [
        {
          id: 'issue-1',
          title: 'Heizung defekt',
          status: 'OPEN',
          type: 'DEFECT',
          modifiedAt: '2026-01-03T10:00:00.000Z',
          agreementId: 'agreement-1',
          description: 'Die Heizung ist kalt.',
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
    vi.mocked(tenantIssueService.getIssues).mockResolvedValue({
      size: 0,
      issues: [],
    });

    const { TenantIssueList } = await import('@/features/tenant/tenantIssues');
    const wrapper = mount(TenantIssueList);

    await flushPromises();

    expect(wrapper.findAll('[data-testid="tenant-issue-card"]')).toHaveLength(0);
    expect(wrapper.find('.pi.pi-inbox').exists()).toBe(true);
  });

  it('filters issues by status on the client side without refetching', async () => {
    vi.mocked(tenancyService.getTenancies).mockResolvedValue([]);
    vi.mocked(tenantIssueService.getIssues).mockResolvedValue({
      size: 2,
      issues: [
        {
          id: 'issue-closed',
          title: 'Geschlossen',
          status: 'CLOSED',
          type: 'DEFECT',
          agreementId: 'agreement-1',
          description: 'Beschreibung',
        },
        {
          id: 'issue-open',
          title: 'Tür klemmt',
          status: 'OPEN',
          type: 'DEFECT',
          agreementId: 'agreement-1',
          description: 'Beschreibung',
        },
      ],
    });

    const { TenantIssueList } = await import('@/features/tenant/tenantIssues');
    const wrapper = mount(TenantIssueList, { global: { stubs: { NewTenancyIssueDialog: true } } });

    await flushPromises();
    expect(tenantIssueService.getIssues).toHaveBeenCalledTimes(1);

    const selects = wrapper.findAllComponents(Select);
    await selects[1].vm.$emit('update:modelValue', 'OPEN');
    await flushPromises();

    expect(tenantIssueService.getIssues).toHaveBeenCalledTimes(1);
    const cardTexts = wrapper.findAll('[data-testid="tenant-issue-card"]').map((card) => card.text());
    expect(cardTexts).toHaveLength(1);
    expect(cardTexts[0]).toContain('Tür klemmt');
  });

  it('filters issues by tenancy on the client side', async () => {
    vi.mocked(tenancyService.getTenancies).mockResolvedValue([]);
    vi.mocked(tenantIssueService.getIssues).mockResolvedValue({
      size: 2,
      issues: [
        {
          id: 'issue-agreement-1',
          title: 'Wohnung 1 Schaden',
          status: 'OPEN',
          type: 'DEFECT',
          agreementId: 'agreement-1',
          description: 'Beschreibung',
        },
        {
          id: 'issue-agreement-2',
          title: 'Wohnung 2 Schaden',
          status: 'OPEN',
          type: 'DEFECT',
          agreementId: 'agreement-2',
          description: 'Beschreibung',
        },
      ],
    });

    const { TenantIssueList } = await import('@/features/tenant/tenantIssues');
    const wrapper = mount(TenantIssueList);

    await flushPromises();

    const selects = wrapper.findAllComponents(Select);
    await selects[0].vm.$emit('update:modelValue', 'agreement-2');
    await flushPromises();

    const cardTexts = wrapper.findAll('[data-testid="tenant-issue-card"]').map((card) => card.text());
    expect(cardTexts).toHaveLength(1);
    expect(cardTexts[0]).toContain('Wohnung 2 Schaden');
  });

  it('sorts issues by status when no status filter is active', async () => {
    vi.mocked(tenancyService.getTenancies).mockResolvedValue([]);
    vi.mocked(tenantIssueService.getIssues).mockResolvedValue({
      size: 5,
      issues: [
        {
          id: 'issue-closed',
          title: 'Closed',
          status: 'CLOSED',
          type: 'TASK',
          agreementId: 'agreement-1',
          description: 'Beschreibung',
        },
        {
          id: 'issue-rejected',
          title: 'Rejected',
          status: 'REJECTED',
          type: 'TASK',
          agreementId: 'agreement-1',
          description: 'Beschreibung',
        },
        {
          id: 'issue-open',
          title: 'Open',
          status: 'OPEN',
          type: 'TASK',
          agreementId: 'agreement-1',
          description: 'Beschreibung',
        },
        {
          id: 'issue-in-progress',
          title: 'In Progress',
          status: 'IN_PROGRESS',
          type: 'TASK',
          agreementId: 'agreement-1',
          description: 'Beschreibung',
        },
        {
          id: 'issue-pending',
          title: 'Pending',
          status: 'PENDING',
          type: 'TASK',
          agreementId: 'agreement-1',
          description: 'Beschreibung',
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
    vi.mocked(tenantIssueService.getIssues).mockResolvedValue({
      size: 3,
      issues: [
        {
          id: 'issue-defect',
          title: 'Defect issue',
          status: 'OPEN',
          type: 'DEFECT',
          agreementId: 'agreement-1',
          description: 'Beschreibung',
        },
        {
          id: 'issue-task',
          title: 'Task issue',
          status: 'OPEN',
          type: 'TASK',
          agreementId: 'agreement-1',
          description: 'Beschreibung',
        },
        {
          id: 'issue-maintenance',
          title: 'Maintenance issue',
          status: 'OPEN',
          type: 'MAINTENANCE',
          agreementId: 'agreement-1',
          description: 'Beschreibung',
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
    vi.mocked(tenantIssueService.getIssues).mockResolvedValue({
      size: 3,
      issues: [
        {
          id: 'ABC-123',
          title: 'Heizung kaputt',
          status: 'OPEN',
          type: 'DEFECT',
          agreementId: 'agreement-1',
          description: 'Beschreibung',
        },
        {
          id: 'DEF-456',
          title: 'Fenster defekt',
          status: 'OPEN',
          type: 'DEFECT',
          agreementId: 'agreement-1',
          description: 'Beschreibung',
        },
        {
          id: 'GHI-789',
          title: 'Wasserleck',
          status: 'OPEN',
          type: 'MAINTENANCE',
          agreementId: 'agreement-1',
          description: 'Beschreibung',
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
    vi.mocked(tenantIssueService.getIssues).mockRejectedValue(new Error('request failed'));

    const { TenantIssueList } = await import('@/features/tenant/tenantIssues');
    const wrapper = mount(TenantIssueList);

    await flushPromises();

    expect(wrapper.text()).toContain('Fehler');
    expect(wrapper.findAll('[data-testid="tenant-issue-card"]')).toHaveLength(0);
  });
});
