import { describe, expect, it, vi } from 'vitest';
import { flushPromises, shallowMount, mount } from '@vue/test-utils';
import TimelineCard from '@/components/common/TimelineCard.vue';
import IssueTimelineItemCard from '@/features/project/issues/components/IssueTimelineItemCard.vue';
import { issueTimelineService, type TimelineJson } from '@/features/project/issues/services/IssueTimelineService';

vi.mock('@/features/project/issues/services/IssueTimelineService', async () => {
  const actual = await vi.importActual<typeof import('@/features/project/issues/services/IssueTimelineService')>(
    '@/features/project/issues/services/IssueTimelineService',
  );
  return {
    ...actual,
    issueTimelineService: {
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

const mountCardShallow = async (issueId = 'issue-1', visibleToTenants = true) => {
  const { default: IssueTimelineCard } = await import(
    '@/features/project/issues/components/IssueTimelineCard.vue'
  );
  return shallowMount(IssueTimelineCard, { props: { issueId, visibleToTenants } });
};

describe('IssueTimelineCard component', () => {
  it('loads timeline entries for the given issue', async () => {
    vi.mocked(issueTimelineService.getTimelineEntries).mockResolvedValueOnce({ timelines: [makeTimeline()] });

    const wrapper = await mountCardShallow('issue-1');
    const result = await wrapper.getComponent(TimelineCard).props('load')();

    expect(issueTimelineService.getTimelineEntries).toHaveBeenCalledWith('issue-1');
    expect(result).toEqual([makeTimeline()]);
  });

  it('sends messages with attachments for the given issue', async () => {
    vi.mocked(issueTimelineService.createTimelineEntryWithAttachments).mockResolvedValueOnce();

    const wrapper = await mountCardShallow('issue-1');
    const send = wrapper.getComponent(TimelineCard).props('send');
    const files = [new File(['a'], 'a.pdf')];
    await send({ purpose: 'MESSAGE_SENT', message: 'Hallo' }, files);

    expect(issueTimelineService.createTimelineEntryWithAttachments).toHaveBeenCalledWith(
      'issue-1',
      { purpose: 'MESSAGE_SENT', message: 'Hallo' },
      files,
    );
  });

  it('renders IssueTimelineItemCard for each entry with item and issueId', async () => {
    const timeline = makeTimeline({ timelineId: 'abc' });
    vi.mocked(issueTimelineService.getTimelineEntries).mockResolvedValueOnce({ timelines: [timeline] });

    const { default: IssueTimelineCard } = await import(
      '@/features/project/issues/components/IssueTimelineCard.vue'
    );
    const wrapper = mount(IssueTimelineCard, {
      props: { issueId: 'issue-1', visibleToTenants: true },
      global: { stubs: { IssueTimelineItemCard: true } },
    });
    await flushPromises();

    const itemCard = wrapper.getComponent(IssueTimelineItemCard);
    expect(itemCard.props('item')).toEqual(timeline);
    expect(itemCard.props('issueId')).toBe('issue-1');
  });
});
