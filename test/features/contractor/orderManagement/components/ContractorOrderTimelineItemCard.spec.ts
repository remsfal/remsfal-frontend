import { describe, expect, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import type { ContractorTimelineJson }
  from '@/features/contractor/orderManagement/services/ContractorOrderTimelineService';
import ContractorOrderTimelineItemCard from
  '@/features/contractor/orderManagement/components/ContractorOrderTimelineItemCard.vue';
import TimelineEntryCard from '@/components/TimelineEntryCard.vue';

const makeTimeline = (overrides: Partial<ContractorTimelineJson> = {}): ContractorTimelineJson => ({
  timelineId: 'timeline-1',
  purpose: 'MESSAGE_SENT',
  message: '',
  senderRole: 'CONTRACTOR',
  createdAt: '2026-01-02T10:00:00.000Z',
  ...overrides,
});

const mountItemCard = (item: ContractorTimelineJson, issueId = 'issue-1') =>
  shallowMount(ContractorOrderTimelineItemCard, { props: { item, issueId } });

const entryCardProps = (wrapper: ReturnType<typeof mountItemCard>) =>
  wrapper.getComponent(TimelineEntryCard).props();

describe('ContractorOrderTimelineItemCard component', () => {
  it('passes date, message and testId through to TimelineEntryCard', () => {
    const props = entryCardProps(mountItemCard(makeTimeline({ message: 'Hallo' })));

    expect(props.date).toBe('2026-01-02T10:00:00.000Z');
    expect(props.message).toBe('Hallo');
    expect(props.testId).toBe('contractor-order-timeline-entry');
  });

  it.each([
    ['WITHDRAWN', 'Zurückgezogen'],
    ['REJECTED', 'Abgelehnt'],
    ['CONFIRMED', 'Bestätigt'],
  ] as const)(
    'translates a STATUS_CHANGED message of %s using the existing status i18n keys',
    (status, expectedMessage) => {
      const props = entryCardProps(mountItemCard(makeTimeline({ purpose: 'STATUS_CHANGED', message: status })));

      expect(props.message).toBe(expectedMessage);
    },
  );

  it('passes the backend-provided attachment download URL through unchanged', () => {
    const wrapper = mountItemCard(
      makeTimeline({
        attachments: [{
          attachmentId: 'att-1',
          fileName: 'report.pdf',
          contentType: 'application/pdf',
          downloadUrl: '/ticketing/v1/order-management/issue-1/attachments/att-1/report.pdf',
        }],
      }),
    );

    expect(entryCardProps(wrapper).attachments).toEqual([
      expect.objectContaining({
        attachmentId: 'att-1',
        downloadUrl: '/ticketing/v1/order-management/issue-1/attachments/att-1/report.pdf',
      }),
    ]);
  });
});
