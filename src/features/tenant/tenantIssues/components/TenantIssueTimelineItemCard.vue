<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { TenantTimelineJson } from '@/features/tenant/tenantIssues/services/TenantTimelineService';
import TimelineEntryCard from '@/components/TimelineEntryCard.vue';
import { buildAttachmentDownloadUrl, useTimelineItem } from '@/composables/useTimelineItem';

const props = defineProps<{
  item: TenantTimelineJson;
  issueId: string;
}>();

const { t } = useI18n();

const { title, attachments } = useTimelineItem(props, {
  titleNamespace: 'tenantIssues.timeline',
  buildAttachmentUrl: buildAttachmentDownloadUrl(
    `/ticketing/v1/tenant-relations/issues/${encodeURIComponent(props.issueId)}`,
  ),
});
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
