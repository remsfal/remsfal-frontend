<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { TimelineJson } from '@/features/tenant/tenantIssues/services/TenantTimelineService';
import TimelineEntryCard from '@/components/common/TimelineEntryCard.vue';
import { useTimelineItem } from '@/composables/useTimelineItem';

const props = defineProps<{
  item: TimelineJson;
  issueId: string;
}>();

const { t } = useI18n();

const buildDownloadUrl = (issueId: string, attachmentId: string, fileName?: string) => {
  const encodedIssueId = encodeURIComponent(issueId);
  const encodedAttachmentId = encodeURIComponent(attachmentId);
  const encodedFileName = encodeURIComponent(fileName || attachmentId);
  return `/ticketing/v1/tenant-relations/issues/${encodedIssueId}/attachments/${encodedAttachmentId}/${encodedFileName}`;
};

const { title, attachments } = useTimelineItem(props, buildDownloadUrl);
</script>

<template>
  <TimelineEntryCard
    :date="item.createdAt"
    :title="title"
    :message="item.message"
    :attachments="attachments"
    :attachmentsLabel="t('tenantIssues.timeline.attachmentsCount')"
    :downloadAttachmentLabel="t('tenantIssues.timeline.downloadAttachment')"
    testId="tenant-issue-timeline-entry"
  />
</template>
