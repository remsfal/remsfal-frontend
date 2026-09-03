import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TimelineJson } from '@/composables/useTimeline';
import type { TimelineAttachmentView } from '@/components/TimelineEntryCard.vue';

export interface UseTimelineItemProps {
  item: TimelineJson;
  issueId: string;
}

export function useTimelineItem(props: UseTimelineItemProps, attachmentsBasePath: string) {
  const { t } = useI18n();

  const buildDownloadUrl = (issueId: string, attachmentId: string, fileName?: string) => {
    const encodedIssueId = encodeURIComponent(issueId);
    const encodedAttachmentId = encodeURIComponent(attachmentId);
    const encodedFileName = encodeURIComponent(fileName || attachmentId);
    return `${attachmentsBasePath}/${encodedIssueId}/attachments/${encodedAttachmentId}/${encodedFileName}`;
  };

  const getIssueNumber = (issueId: string) => issueId.split('-').pop() || issueId;

  const title = computed(() => {
    const timelineItem = props.item;
    const senderName = timelineItem.senderName?.trim() || t('common.notSet');

    switch (timelineItem.purpose) {
      case 'ISSUE_CREATED':
        return t('tenantIssues.timeline.issueCreatedTitle', {
          issueNumber: getIssueNumber(timelineItem.issueId ?? props.issueId),
          senderName,
        });
      case 'MESSAGE_SENT':
        return t('tenantIssues.timeline.tenantMessageTitle', { senderName });
      case 'APPOINTMENT_REQUESTED':
        return t('tenantIssues.timeline.appointmentRequestedTitle', { senderName });
      case 'APPOINTMENT_SCHEDULED':
        return t('tenantIssues.timeline.appointmentScheduledTitle', { senderName });
      case 'STATUS_CHANGED':
        return t('tenantIssues.timeline.statusChangedTitle');
      default:
        return t('tenantIssues.timeline.entryFallbackTitle');
    }
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
        downloadUrl: buildDownloadUrl(props.issueId, attachmentId, fileName),
        fileName,
      }];
    }),
  );

  return { title, attachments };
}
