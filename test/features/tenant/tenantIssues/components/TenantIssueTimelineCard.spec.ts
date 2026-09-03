import { describe, expect, it, vi } from 'vitest';
import { flushPromises, shallowMount, mount } from '@vue/test-utils';
import TimelineCard from '@/components/TimelineCard.vue';
import TenantIssueTimelineItemCard from '@/features/tenant/tenantIssues/components/TenantIssueTimelineItemCard.vue';
import { tenantTimelineService, type TimelineJson } from '@/features/tenant/tenantIssues/services/TenantTimelineService';

vi.mock('@/features/tenant/tenantIssues/services/TenantTimelineService', async () => {
  const actual = await vi.importActual<typeof import('@/features/tenant/tenantIssues/services/TenantTimelineService')>(
    '@/features/tenant/tenantIssues/services/TenantTimelineService',
  );
  return {
    ...actual,
    tenantTimelineService: {
      getTimelineEntries: vi.fn(),
      createTimelineEntryWithAttachments: vi.fn(),
    },
  };
});

const makeTimeline = (overrides: Partial<TimelineJson> = {}): TimelineJson => ({
  timelineId: 'timeline-1',
  purpose: 'MESSAGE_SENT',
  message: '',
  createdAt: '2026-01-02T10:00:00.000Z',
  ...overrides,
});

const mountCardShallow = async (issueId = 'issue-1') => {
  const { default: TenantIssueTimelineCard } = await import(
    '@/features/tenant/tenantIssues/components/TenantIssueTimelineCard.vue'
  );
  return shallowMount(TenantIssueTimelineCard, { props: { issueId } });
};

describe('TenantIssueTimelineCard component', () => {
  it('loads timeline entries for the given issue', async () => {
    vi.mocked(tenantTimelineService.getTimelineEntries).mockResolvedValueOnce({ timelines: [makeTimeline()] });

    const wrapper = await mountCardShallow('issue-1');
    const result = await wrapper.getComponent(TimelineCard).props('load')();

    expect(tenantTimelineService.getTimelineEntries).toHaveBeenCalledWith('issue-1');
    expect(result).toEqual([makeTimeline()]);
  });

  it('sends messages with attachments for the given issue', async () => {
    vi.mocked(tenantTimelineService.createTimelineEntryWithAttachments).mockResolvedValueOnce();

    const wrapper = await mountCardShallow('issue-1');
    const send = wrapper.getComponent(TimelineCard).props('send');
    const files = [new File(['a'], 'a.pdf')];
    await send({ purpose: 'MESSAGE_SENT', message: 'Hallo' }, files);

    expect(tenantTimelineService.createTimelineEntryWithAttachments).toHaveBeenCalledWith(
      'issue-1',
      { purpose: 'MESSAGE_SENT', message: 'Hallo' },
      files,
    );
  });

  it.each([
    {
      label: 'CLOSED',
      message: 'CLOSED',
      expected: true,
    },
    {
      label: 'REJECTED',
      message: 'REJECTED',
      expected: true,
    },
    {
      label: 'normalized rejected',
      message: '  rejected  ',
      expected: true,
    },
    {
      label: 'OPEN',
      message: 'OPEN',
      expected: false,
    },
  ])('reports isBlocked=$expected for status message $label', async ({ message, expected }) => {
    const wrapper = await mountCardShallow();
    const isBlocked = wrapper.getComponent(TimelineCard).props('isBlocked');

    expect(isBlocked?.([makeTimeline({ purpose: 'STATUS_CHANGED', message })])).toBe(expected);
  });

  it('renders TenantIssueTimelineItemCard for each entry with item and issueId', async () => {
    const timeline = makeTimeline({ timelineId: 'abc' });
    vi.mocked(tenantTimelineService.getTimelineEntries).mockResolvedValueOnce({ timelines: [timeline] });

    const { default: TenantIssueTimelineCard } = await import(
      '@/features/tenant/tenantIssues/components/TenantIssueTimelineCard.vue'
    );
    const wrapper = mount(TenantIssueTimelineCard, {
      props: { issueId: 'issue-1' },
      global: { stubs: { TenantIssueTimelineItemCard: true } },
    });
    await flushPromises();

    const itemCard = wrapper.getComponent(TenantIssueTimelineItemCard);
    expect(itemCard.props('item')).toEqual(timeline);
    expect(itemCard.props('issueId')).toBe('issue-1');
  });
});
