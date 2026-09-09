<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Image from 'primevue/image';
import { formatDateTime } from '@/helper/dateHelper';
import { isImageAttachment, getAttachmentTypeLabel } from '@/helper/attachmentHelper';

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
  /**
   * Renders this entry as an own/outgoing chat message: the row is reversed so the
   * bubble sits on the right with a light gray background (e.g. for IssueChatCard).
   */
  own?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  attachments: () => [],
  testId: 'timeline-entry',
  own: false,
});

const { locale } = useI18n();

const formattedDate = computed(() => formatDateTime(props.date, locale.value));

const imageAttachments = computed(() => props.attachments.filter(isImageAttachment));

const nonImageAttachments = computed(() => props.attachments.filter((attachment) => !isImageAttachment(attachment)));

const openAttachmentDownload = (downloadUrl: string) => {
  window.open(downloadUrl, '_blank', 'noopener,noreferrer');
};
</script>

<template>
  <div class="mb-2 flex items-start gap-3" :class="{ 'flex-row-reverse': own }">
    <span class="w-40 shrink-0 text-sm text-gray-500" :class="{ 'text-right': own }">
      {{ formattedDate || '-' }}
    </span>
    <article
      :data-testid="testId"
      class="flex-1 rounded-lg border border-gray-200 p-4"
      :class="own ? 'bg-gray-100' : 'bg-white'"
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
