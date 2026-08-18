import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import IssueKpiCards from '@/features/project/issues/components/IssueKpiCards.vue';
import KpiCard from '@/components/common/KpiCard.vue';
import { issueService, type IssueItemJson } from '@/services/IssueService';

vi.mock('@/services/IssueService', async () => {
  const actual = await vi.importActual<typeof import('@/services/IssueService')>('@/services/IssueService');
  return {
    ...actual,
    issueService: { getIssues: vi.fn() },
  };
});

describe('IssueKpiCards', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the 3 cards in order: pending, open, in progress, with counts aggregated', async () => {
    vi.mocked(issueService.getIssues).mockResolvedValue({
      size: 4,
      issues: [
        { id: '1', status: 'IN_PROGRESS' },
        { id: '2', status: 'OPEN' },
        { id: '3', status: 'OPEN' },
        { id: '4', status: 'PENDING' },
      ] as IssueItemJson[],
    });

    wrapper = mount(IssueKpiCards, { props: { projectId: '123' } });
    await flushPromises();

    const cards = wrapper.findAllComponents(KpiCard);
    expect(cards).toHaveLength(3);

    expect(cards[0]!.props('title')).toBe('Ausstehende Aufgaben und Issues');
    expect(cards[0]!.props('value')).toBe(1);

    expect(cards[1]!.props('title')).toBe('Offene Aufgaben und Issues');
    expect(cards[1]!.props('value')).toBe(2);

    expect(cards[2]!.props('title')).toBe('Aufgaben in Bearbeitung und Issues');
    expect(cards[2]!.props('value')).toBe(1);

    expect(issueService.getIssues).toHaveBeenCalledWith(
      '123', undefined, undefined, undefined, undefined, undefined, undefined, undefined,
    );
  });

  it('does not render a card for statuses with no issues', async () => {
    vi.mocked(issueService.getIssues).mockResolvedValue({
      size: 1,
      issues: [{ id: '1', status: 'OPEN' }] as IssueItemJson[],
    });

    wrapper = mount(IssueKpiCards, { props: { projectId: '123' } });
    await flushPromises();

    const titles = wrapper.findAllComponents(KpiCard).map((card) => card.props('title'));
    expect(titles).toEqual(['Offene Aufgaben und Issues']);
  });

  it('ignores issues with a status other than pending/open/in-progress', async () => {
    vi.mocked(issueService.getIssues).mockResolvedValue({
      size: 3,
      issues: [
        { id: '1', status: 'CLOSED' },
        { id: '2', status: 'REJECTED' },
        { id: '3', status: 'PENDING' },
      ] as IssueItemJson[],
    });

    wrapper = mount(IssueKpiCards, { props: { projectId: '123' } });
    await flushPromises();

    const cards = wrapper.findAllComponents(KpiCard);
    expect(cards).toHaveLength(1);
    expect(cards[0]!.props('title')).toBe('Ausstehende Aufgaben und Issues');
    expect(cards[0]!.props('value')).toBe(1);
  });

  it('ignores issues without a status', async () => {
    vi.mocked(issueService.getIssues).mockResolvedValue({
      size: 2,
      issues: [{ id: '1' }, { id: '2', status: 'OPEN' }] as IssueItemJson[],
    });

    wrapper = mount(IssueKpiCards, { props: { projectId: '123' } });
    await flushPromises();

    const cards = wrapper.findAllComponents(KpiCard);
    expect(cards).toHaveLength(1);
    expect(cards[0]!.props('title')).toBe('Offene Aufgaben und Issues');
    expect(cards[0]!.props('value')).toBe(1);
  });

  it('follows nextCursor to load and aggregate all pages', async () => {
    vi.mocked(issueService.getIssues)
      .mockResolvedValueOnce({
        size: 1,
        issues: [{ id: '1', status: 'OPEN' }] as IssueItemJson[],
        nextCursor: 'cursor-abc',
      })
      .mockResolvedValueOnce({
        size: 1,
        issues: [{ id: '2', status: 'OPEN' }] as IssueItemJson[],
      });

    wrapper = mount(IssueKpiCards, { props: { projectId: '123' } });
    await flushPromises();

    expect(issueService.getIssues).toHaveBeenCalledTimes(2);
    expect(issueService.getIssues).toHaveBeenNthCalledWith(
      2, '123', undefined, undefined, undefined, undefined, undefined, undefined, 'cursor-abc',
    );

    const cards = wrapper.findAllComponents(KpiCard);
    expect(cards).toHaveLength(1);
    expect(cards[0]!.props('value')).toBe(2);
  });

  it('renders no cards and no message when there are no issues', async () => {
    vi.mocked(issueService.getIssues).mockResolvedValue({ size: 0, issues: [] });

    wrapper = mount(IssueKpiCards, { props: { projectId: '123' } });
    await flushPromises();

    expect(wrapper.findComponent(KpiCard).exists()).toBe(false);
    expect(wrapper.text()).toBe('');
  });

  it('shows skeletons while loading', () => {
    vi.mocked(issueService.getIssues).mockReturnValue(new Promise(() => {}));

    wrapper = mount(IssueKpiCards, { props: { projectId: '123' } });

    expect(wrapper.findComponent({ name: 'Skeleton' }).exists()).toBe(true);
    expect(wrapper.findComponent(KpiCard).exists()).toBe(false);
  });

  it('clears the skeleton and shows no cards when the fetch fails', async () => {
    vi.mocked(issueService.getIssues).mockRejectedValueOnce(new Error('Fetch failed'));

    wrapper = mount(IssueKpiCards, { props: { projectId: '123' } });
    await flushPromises();

    expect(wrapper.findComponent({ name: 'Skeleton' }).exists()).toBe(false);
    expect(wrapper.findComponent(KpiCard).exists()).toBe(false);
  });
});
