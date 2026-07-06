<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Image from 'primevue/image';
import BaseCard from '@/components/common/BaseCard.vue';
import type { IssueAttachmentJson } from '@/services/IssueService';

const props = defineProps<{
  issueId: string;
  attachments: IssueAttachmentJson[];
}>();

const { t } = useI18n();

const imageAttachments = computed(() => props.attachments.filter(
  attachment => attachment.contentType?.startsWith('image/')
));
const nonImageAttachmentGroups = computed(() => {
  const groups = new Map<string, number>();
  for (const attachment of props.attachments) {
    if (attachment.contentType?.startsWith('image/')) continue;
    const ext = attachment.fileName?.split('.').pop()?.toUpperCase() ?? '?';
    groups.set(ext, (groups.get(ext) ?? 0) + 1);
  }
  return Array.from(groups.entries()).map(([ext, count]) => ({ ext, count }));
});

function getAttachmentDownloadUrl(attachment: IssueAttachmentJson): string {
  const fileName = attachment.fileName ?? '';
  const attachmentId = attachment.attachmentId ?? '';
  const issueId = attachment.issueId ?? props.issueId;
  const encodedIssueId = encodeURIComponent(issueId);
  const encodedAttachmentId = encodeURIComponent(attachmentId);
  const encodedFileName = encodeURIComponent(fileName);
  return `/ticketing/v1/issues/${encodedIssueId}/attachments/${encodedAttachmentId}/${encodedFileName}`;
}
</script>

<template>
  <BaseCard>
    <template #title>
      <div class="font-semibold text-xl">
        {{ t('issueDetails.attachmentsTitle') }}
      </div>
    </template>

    <template #content>
      <div class="flex flex-col gap-4">
        <div v-if="attachments.length === 0" class="text-sm text-gray-500">
          {{ t('issueDetails.noAttachments') }}
        </div>

        <div v-if="imageAttachments.length > 0 || nonImageAttachmentGroups.length > 0" class="flex flex-wrap gap-2">
          <Image
            v-for="attachment in imageAttachments"
            :key="attachment.attachmentId"
            :src="getAttachmentDownloadUrl(attachment)"
            :alt="attachment.fileName ?? 'issue-attachment'"
            preview
            imageClass="h-24 w-24 object-cover rounded"
          />
          <div
            v-for="group in nonImageAttachmentGroups"
            :key="group.ext"
            data-test="non-image-tile"
            class="h-24 w-24 flex flex-col items-center justify-center gap-1 rounded
               border border-surface-200 bg-surface-100 text-surface-500 text-xs font-medium"
            :aria-label="t('issueDetails.nonImageAttachmentsAriaLabel', { count: group.count, ext: group.ext })"
          >
            <i class="pi pi-file text-2xl" />
            <span>+{{ group.count }}</span>
            <span>{{ group.ext }}</span>
          </div>
        </div>

        <div
          v-for="attachment in attachments"
          :key="attachment.attachmentId"
          class="flex items-center justify-between gap-3 border border-surface-200 rounded-md p-2"
        >
          <a
            :href="getAttachmentDownloadUrl(attachment)"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-primary hover:underline truncate"
          >
            {{ attachment.fileName }}
          </a>
        </div>
      </div>
    </template>
  </BaseCard>
</template>
