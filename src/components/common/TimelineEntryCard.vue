<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Image from 'primevue/image';

export interface TimelineAttachmentView {
  attachmentId: string;
  contentType?: string;
  downloadUrl: string;
  fileName?: string;
}

interface Props {
  date?: string;
  title: string;
  message?: string;
  attachments?: TimelineAttachmentView[];
  attachmentsLabel?: string;
  downloadAttachmentLabel?: string;
  testId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  attachments: () => [],
  testId: 'timeline-entry',
});

const { locale } = useI18n();

const imageFileExtensions = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']);

const formattedDate = computed(() => {
  if (!props.date) return null;
  const date = new Date(props.date);
  if (Number.isNaN(date.getTime())) return props.date;
  return date.toLocaleString(locale.value);
});

const isImageAttachment = (attachment: TimelineAttachmentView) => {
  if (attachment.contentType?.startsWith('image/')) {
    return true;
  }

  const fileName = attachment.fileName?.trim().toLowerCase();
  if (!fileName || !fileName.includes('.')) {
    return false;
  }

  const extension = fileName.split('.').pop();
  return extension ? imageFileExtensions.has(extension) : false;
};

const imageAttachments = computed(() => props.attachments.filter(isImageAttachment));
const nonImageAttachments = computed(() =>
  props.attachments.filter((attachment) => !isImageAttachment(attachment)),
);

const getAttachmentTypeLabel = (attachment: TimelineAttachmentView) => {
  const fileName = attachment.fileName?.trim().toLowerCase();
  if (!fileName || !fileName.includes('.')) {
    return 'FILE';
  }

  const extension = fileName.split('.').pop();
  return extension ? extension.toUpperCase() : 'FILE';
};

const openAttachmentDownload = (downloadUrl: string) => {
  window.open(downloadUrl, '_blank', 'noopener,noreferrer');
};
</script>

<template>
  <div class="mb-2 flex items-start gap-3">
    <span class="w-40 shrink-0 text-sm text-gray-500">
      {{ formattedDate || '-' }}
    </span>
    <article
      :data-testid="testId"
      class="flex-1 rounded-lg border border-gray-200 bg-white p-4"
    >
      <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p class="text-lg font-semibold text-gray-900">
          {{ title }}
        </p>
      </div>
      <p v-if="message" class="text-gray-700 text-left whitespace-pre-line">
        {{ message }}
      </p>
      <div v-if="attachments.length > 0" class="mt-3 rounded bg-gray-50 p-2 text-sm">
        <p class="mb-1 text-left text-gray-700">
          {{ attachmentsLabel }}
        </p>
        <div class="mb-3 flex flex-wrap gap-2">
          <div
            v-for="attachment in imageAttachments"
            :key="`preview-${attachment.attachmentId}`"
            class="relative"
          >
            <Image
              :src="attachment.downloadUrl"
              :alt="attachment.fileName ?? 'attachment'"
              preview
              imageClass="h-24 w-24 object-cover rounded"
            />
            <Button
              icon="pi pi-download"
              size="small"
              severity="contrast"
              rounded
              class="!absolute bottom-1 right-1"
              :aria-label="downloadAttachmentLabel"
              @click="openAttachmentDownload(attachment.downloadUrl)"
            />
          </div>
          <button
            v-for="attachment in nonImageAttachments"
            :key="`file-${attachment.attachmentId}`"
            type="button"
            class="h-24 w-24 cursor-pointer rounded border border-surface-200 bg-surface-100 p-2 text-surface-700"
            :aria-label="downloadAttachmentLabel"
            @click="openAttachmentDownload(attachment.downloadUrl)"
          >
            <div class="flex h-full flex-col items-center justify-center gap-1">
              <i class="pi pi-file text-xl" />
              <span class="text-[10px] font-semibold">{{ getAttachmentTypeLabel(attachment) }}</span>
            </div>
          </button>
        </div>
      </div>
    </article>
  </div>
</template>
