<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { TenantTimelineJson } from '@/features/tenant/tenantIssues/services/TenantTimelineService';
import TimelineEntryCard from '@/components/TimelineEntryCard.vue';
import { useTimelineItem } from '@/composables/useTimelineItem';
import { getIssueStatusLabel } from '@/features/common/issues/issueLabels';
import type { IssueStatus } from '@/features/project/issues/services/IssueService';

const props = defineProps<{
  item: TenantTimelineJson;
  issueId: string;
}>();

const { t } = useI18n();

const { title, message, attachments } = useTimelineItem(props, {
  titleNamespace: 'tenantIssues.timeline',
  showSenderRole: true,
  statusLabel: (status) => getIssueStatusLabel(status as IssueStatus, t),
});
</script>

<template>
  <TimelineEntryCard
    :date="item.createdAt"
    :title="title"
    :message="message"
    :attachments="attachments"
    :attachmentsLabel="t('tenantIssues.timeline.attachmentsCount')"
    :downloadAttachmentLabel="t('tenantIssues.timeline.downloadAttachment')"
    testId="tenant-issue-timeline-entry"
  />
</template>
