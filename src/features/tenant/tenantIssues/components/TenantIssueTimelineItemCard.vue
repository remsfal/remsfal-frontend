<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TimelineJson } from '@/features/tenant/tenantIssues/services/TenantTimelineService';
import TimelineEntryCard, { type TimelineAttachmentView } from '@/components/common/TimelineEntryCard.vue';

const props = defineProps<{
  item: TimelineJson;
  issueId: string;
}>();

const { t } = useI18n();

const getIssueNumber = (issueId: string) => issueId.split('-').pop() || issueId;

const getTimelineTitle = (timelineItem: TimelineJson) => {
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
};

const getTimelineAttachmentDownloadUrl = (issueId: string, attachmentId: string, fileName?: string) => {
  const encodedIssueId = encodeURIComponent(issueId);
  const encodedAttachmentId = encodeURIComponent(attachmentId);
  const encodedFileName = encodeURIComponent(fileName || attachmentId);
  return `/ticketing/v1/tenant-relations/issues/${encodedIssueId}/attachments/${encodedAttachmentId}/${encodedFileName}`;
};

const timelineAttachments = computed<TimelineAttachmentView[]>(() => {
  return (props.item.attachments ?? []).flatMap((attachment) => {
    const attachmentId = attachment.attachmentId;
    if (!attachmentId) {
      return [];
    }

    const fileName = attachment.fileName;
    return [{
      attachmentId,
      contentType: attachment.contentType,
      downloadUrl: getTimelineAttachmentDownloadUrl(props.issueId, attachmentId, fileName),
      fileName,
    }];
  });
});
</script>

<template>
  <TimelineEntryCard
    :date="item.createdAt"
    :title="getTimelineTitle(item)"
    :message="item.message"
    :attachments="timelineAttachments"
    :attachmentsLabel="t('tenantIssues.timeline.attachmentsCount')"
    :downloadAttachmentLabel="t('tenantIssues.timeline.downloadAttachment')"
    testId="tenant-issue-timeline-entry"
  />
</template>
