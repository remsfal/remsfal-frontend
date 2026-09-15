import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TimelineEntry } from '@/composables/useTimeline';
import type { TimelineAttachmentView } from '@/components/TimelineEntryCard.vue';

export interface UseTimelineItemProps<T extends TimelineEntry> {
  item: T;
  issueId?: string;
}

export interface UseTimelineItemOptions {
  titleNamespace: string;
  buildAttachmentUrl: (attachmentId: string, fileName?: string) => string;
}

export function buildAttachmentDownloadUrl(resourcePrefix: string) {
  return (attachmentId: string, fileName?: string) => {
    const encodedAttachmentId = encodeURIComponent(attachmentId);
    const encodedFileName = encodeURIComponent(fileName || attachmentId);
    return `${resourcePrefix}/attachments/${encodedAttachmentId}/${encodedFileName}`;
  };
}

const STATUS_NAMESPACES = ['quotationRequest.status', 'orderPlacement.status'];

export function useTimelineItem<T extends TimelineEntry>(
  props: UseTimelineItemProps<T>,
  options: UseTimelineItemOptions,
) {
  const { t, te } = useI18n();
  const { titleNamespace, buildAttachmentUrl } = options;

  const getIssueNumber = (issueId: string) => issueId.split('-').pop() || issueId;

  const title = computed(() => {
    const timelineItem = props.item;
    const senderName = timelineItem.senderName?.trim() || t('common.notSet');
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

  const attachments = computed<TimelineAttachmentView[]>(() =>
    (props.item.attachments ?? []).flatMap((attachment) => {
      const attachmentId = attachment.attachmentId;
      if (!attachmentId) {
        return [];
      }

      const fileName = attachment.fileName;
      return [{
        attachmentId,
        contentType: attachment.contentType,
        downloadUrl: buildAttachmentUrl(attachmentId, fileName),
        fileName,
      }];
    }),
  );

  return {
    title,
    message,
    attachments,
  };
}
