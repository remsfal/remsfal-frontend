import { describe, expect, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import i18n from '@/i18n/i18n';
import type { ContractorTimelineJson }
  from '@/features/contractor/orderManagement/services/ContractorOrderTimelineService';
import type { OrderAttachmentJson } from '@/features/contractor/orderManagement/services/OrderAttachmentService';
import ContractorOrderTimelineItemCard from
  '@/features/contractor/orderManagement/components/ContractorOrderTimelineItemCard.vue';
import TimelineEntryCard from '@/components/common/TimelineEntryCard.vue';

const makeTimeline = (overrides: Partial<ContractorTimelineJson> = {}): ContractorTimelineJson => ({
  timelineId: 'timeline-1',
  purpose: 'MESSAGE_SENT',
  message: '',
  senderRole: 'CONTRACTOR',
  createdAt: '2026-01-02T10:00:00.000Z',
  ...overrides,
});

const mountItemCard = (
  item: ContractorTimelineJson,
  requestId = 'request-1',
  attachmentsById: Map<string, OrderAttachmentJson> = new Map(),
) => shallowMount(ContractorOrderTimelineItemCard, {
  props: {
    item, requestId, attachmentsById 
  } 
});

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

  it('resolves attachmentIds present in attachmentsById into downloadable attachments', () => {
    const attachmentsById = new Map<string, OrderAttachmentJson>([
      ['att-1', {
        attachmentId: 'att-1', fileName: 'report.pdf', contentType: 'application/pdf' 
      }],
    ]);
    const wrapper = mountItemCard(
      makeTimeline({ attachmentIds: ['att-1'] }),
      'request-1',
      attachmentsById,
    );

    expect(entryCardProps(wrapper).attachments).toEqual([
      expect.objectContaining({
        attachmentId: 'att-1',
        fileName: 'report.pdf',
        downloadUrl: '/ticketing/v1/order-management/quotation-requests/request-1/attachments/att-1/report.pdf',
      }),
    ]);
  });

  it('shows an unresolved-attachment hint for attachmentIds missing from attachmentsById', () => {
    const wrapper = mountItemCard(makeTimeline({ attachmentIds: ['att-1', 'att-2'] }));

    expect(entryCardProps(wrapper).attachments).toEqual([]);
    const hint = wrapper.get('[data-testid="contractor-order-timeline-unresolved-attachment"]');
    expect(hint.text()).toContain('2');
  });

  it('renders no unresolved hint when there are no attachmentIds', () => {
    const wrapper = mountItemCard(makeTimeline());

    expect(wrapper.find('[data-testid="contractor-order-timeline-unresolved-attachment"]').exists()).toBe(false);
  });
});
