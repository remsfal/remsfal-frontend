import { describe, expect, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import i18n from '@/i18n/i18n';
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

const mountItemCard = (item: ContractorTimelineJson, requestId = 'request-1') =>
  shallowMount(ContractorOrderTimelineItemCard, { props: { item, requestId } });

const entryCardProps = (wrapper: ReturnType<typeof mountItemCard>) =>
  wrapper.getComponent(TimelineEntryCard).props();

describe('ContractorOrderTimelineItemCard component', () => {
  it('passes date, message and testId through to TimelineEntryCard', () => {
    const props = entryCardProps(mountItemCard(makeTimeline({ message: 'Hallo' })));

    expect(props.date).toBe('2026-01-02T10:00:00.000Z');
    expect(props.message).toBe('Hallo');
    expect(props.testId).toBe('contractor-order-timeline-entry');
  });

  it('renders purpose-based titles including fallback', () => {
    const titleFor = (overrides: Partial<ContractorTimelineJson>) =>
      entryCardProps(mountItemCard(makeTimeline(overrides))).title;

    expect(titleFor({ purpose: 'ISSUE_CREATED', senderName: 'Alex' })).toBe(
      i18n.global.t('orderManagement.timeline.issueCreatedTitle', { senderName: 'Alex' }),
    );
    expect(titleFor({ purpose: 'MESSAGE_SENT', senderName: 'Alex' })).toBe(
      i18n.global.t('orderManagement.timeline.messageTitle', { senderName: 'Alex' }),
    );
    expect(titleFor({ purpose: 'APPOINTMENT_REQUESTED', senderName: 'Alex' })).toBe(
      i18n.global.t('orderManagement.timeline.appointmentRequestedTitle', { senderName: 'Alex' }),
    );
    expect(titleFor({ purpose: 'APPOINTMENT_SCHEDULED', senderName: 'Alex' })).toBe(
      i18n.global.t('orderManagement.timeline.appointmentScheduledTitle', { senderName: 'Alex' }),
    );
    expect(titleFor({ purpose: 'STATUS_CHANGED' })).toBe(i18n.global.t('orderManagement.timeline.statusChangedTitle'));
    expect(titleFor({ purpose: undefined })).toBe(i18n.global.t('orderManagement.timeline.entryFallbackTitle'));
  });

  it('builds attachment download URLs, falling back to the attachment id as filename', () => {
    const wrapper = mountItemCard(
      makeTimeline({
        attachments: [
          {
            attachmentId: 'att-1',
            fileName: 'report.pdf',
            contentType: 'application/pdf',
          },
          { attachmentId: 'fallback-att', contentType: 'application/pdf' },
        ],
      }),
    );

    expect(entryCardProps(wrapper).attachments).toEqual([
      expect.objectContaining({
        attachmentId: 'att-1',
        downloadUrl: '/ticketing/v1/order-management/quotation-requests/request-1/attachments/att-1/report.pdf',
      }),
      expect.objectContaining({
        attachmentId: 'fallback-att',
        downloadUrl:
          '/ticketing/v1/order-management/quotation-requests/request-1/attachments/fallback-att/fallback-att',
      }),
    ]);
  });

  it('encodes request, attachment and filename in the generated download URL', () => {
    const wrapper = mountItemCard(
      makeTimeline({
        attachments: [{
          attachmentId: 'att id/1',
          fileName: 'file name #1.pdf',
          contentType: 'application/pdf',
        }],
      }),
      'request id/ä',
    );

    expect(entryCardProps(wrapper).attachments?.[0]?.downloadUrl).toBe(
      '/ticketing/v1/order-management/quotation-requests/request%20id%2F%C3%A4'
      + '/attachments/att%20id%2F1/file%20name%20%231.pdf',
    );
  });
});
