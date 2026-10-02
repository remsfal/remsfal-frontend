import { describe, expect, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import type { TenantTimelineJson } from '@/features/project/issues/services/IssueTimelineService';
import IssueTimelineItemCard from '@/features/project/issues/components/IssueTimelineItemCard.vue';
import TimelineEntryCard from '@/components/TimelineEntryCard.vue';

const makeTimeline = (overrides: Partial<TenantTimelineJson> = {}): TenantTimelineJson => ({
  timelineId: 'timeline-1',
  purpose: 'MESSAGE_SENT',
  message: '',
  createdAt: '2026-01-02T10:00:00.000Z',
  ...overrides,
});

const mountItemCard = (item: TenantTimelineJson, issueId = 'issue-1') =>
  shallowMount(IssueTimelineItemCard, { props: { item, issueId } });

const entryCardProps = (wrapper: ReturnType<typeof mountItemCard>) =>
  wrapper.getComponent(TimelineEntryCard).props();

describe('IssueTimelineItemCard component', () => {
  it('passes date, message and testId through to TimelineEntryCard', () => {
    const props = entryCardProps(mountItemCard(makeTimeline({ message: 'Hallo' })));

    expect(props.date).toBe('2026-01-02T10:00:00.000Z');
    expect(props.message).toBe('Hallo');
    expect(props.testId).toBe('issue-timeline-entry');
  });

  it('passes the backend-provided attachment download URL through unchanged', () => {
    const wrapper = mountItemCard(
      makeTimeline({
        attachments: [{
          attachmentId: 'att-1',
          fileName: 'report.pdf',
          contentType: 'application/pdf',
          downloadUrl: '/ticketing/v1/issues/issue-1/attachments/att-1/report.pdf',
        }],
      }),
    );

    expect(entryCardProps(wrapper).attachments).toEqual([
      expect.objectContaining({
        attachmentId: 'att-1',
        downloadUrl: '/ticketing/v1/issues/issue-1/attachments/att-1/report.pdf',
      }),
    ]);
  });
});
