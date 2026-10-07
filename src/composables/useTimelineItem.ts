import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TimelineEntry } from '@/composables/useTimeline';
import type { TimelineAttachmentView } from '@/components/TimelineEntryCard.vue';
import { toAttachmentViews } from '@/helper/attachmentHelper';

export interface UseTimelineItemProps<T extends TimelineEntry> {
  item: T;
  issueId?: string;
}

export interface UseTimelineItemOptions {
  titleNamespace: string;
  showSenderRole?: boolean;
}

const STATUS_NAMESPACES = ['quotationRequest.status', 'orderPlacement.status'];

export function useTimelineItem<T extends TimelineEntry>(
  props: UseTimelineItemProps<T>,
  options: UseTimelineItemOptions,
) {
  const { t, te } = useI18n();
  const { titleNamespace, showSenderRole = false } = options;

  const getIssueNumber = (issueId: string) => issueId.split('-').pop() || issueId;

  const getSenderLabel = (timelineItem: T) => {
    const name = timelineItem.senderName?.trim();
    const role = showSenderRole && timelineItem.senderRole
      ? t(`${titleNamespace}.senderRole.${timelineItem.senderRole}`)
      : undefined;

    if (name && role) {
      return t(`${titleNamespace}.senderWithRole`, { senderName: name, role });
    }
    return name || role || t('common.notSet');
  };

  const title = computed(() => {
    const timelineItem = props.item;
    const senderName = getSenderLabel(timelineItem);
    const issueNumber = getIssueNumber(timelineItem.issueId ?? props.issueId ?? '');

    switch (timelineItem.purpose) {
      case 'ISSUE_CREATED':
        return t(`${titleNamespace}.issueCreatedTitle`, { issueNumber, senderName });
      case 'MESSAGE_SENT':
        return t(`${titleNamespace}.messageTitle`, { senderName });
      case 'APPOINTMENT_REQUESTED':
        return t(`${titleNamespace}.appointmentRequestedTitle`, { senderName });
      case 'APPOINTMENT_SCHEDULED':
        return t(`${titleNamespace}.appointmentScheduledTitle`, { senderName });
      case 'STATUS_CHANGED':
        return t(`${titleNamespace}.statusChangedTitle`);
      case 'QUOTATION_REQUESTED':
        return t(`${titleNamespace}.quotationRequestedTitle`, { senderName });
      case 'ORDER_PLACED':
        return t(`${titleNamespace}.orderPlacedTitle`, { senderName });
      case 'REQUEST_CREATED':
        return t(`${titleNamespace}.requestCreatedTitle`, { senderName });
      case 'REQUEST_WITHDRAWN':
        return t(`${titleNamespace}.requestWithdrawnTitle`, { senderName });
      default:
        return t(`${titleNamespace}.entryFallbackTitle`);
    }
  });

  const message = computed(() => {
    const timelineItem = props.item;
    if (timelineItem.purpose !== 'STATUS_CHANGED' || !timelineItem.message) {
      return timelineItem.message;
    }

    const statusKey = STATUS_NAMESPACES.map((namespace) => `${namespace}.${timelineItem.message}`).find((key) =>
      te(key),
    );
    return statusKey ? t(statusKey) : timelineItem.message;
  });

  const attachments = computed<TimelineAttachmentView[]>(() => toAttachmentViews(props.item.attachments));

  return {
    title,
    message,
    attachments,
  };
}
