<script setup lang="ts">
import { computed, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import Card from 'primevue/card';
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import type { FileUploadUploaderEvent } from 'primevue/fileupload';
import Image from 'primevue/image';
import { issueService, type IssueAttachmentJson } from '@/services/IssueService';

const props = defineProps<{
  issueId: string;
  attachments: IssueAttachmentJson[];
}>();

const emit = defineEmits<{ saved: [] }>();

const toast = useToast();
const { t } = useI18n();

const loadingUpload = ref(false);
const deletingAttachmentId = ref<string | null>(null);

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
  const encodedIssueId = encodeURIComponent(props.issueId);
  const encodedAttachmentId = encodeURIComponent(attachmentId);
  const encodedFileName = encodeURIComponent(fileName);
  return `/ticketing/v1/issues/${encodedIssueId}/attachments/${encodedAttachmentId}/${encodedFileName}`;
}

async function handleUpload(event: FileUploadUploaderEvent) {
  const files = Array.isArray(event.files) ? event.files : [];
  if (files.length === 0 || loadingUpload.value) return;

  loadingUpload.value = true;
  try {
    await issueService.uploadAttachments(props.issueId, files as File[]);
    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('issueDetails.attachmentsUploadSuccess'),
      life: 3000,
    });
    emit('saved');
  } catch (error) {
    console.error('Error uploading attachments:', error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('issueDetails.attachmentsUploadError'),
      life: 3000,
    });
  } finally {
    loadingUpload.value = false;
  }
}

async function handleDelete(attachment: IssueAttachmentJson) {
  if (!attachment.attachmentId || deletingAttachmentId.value) return;

  deletingAttachmentId.value = attachment.attachmentId;
  try {
    await issueService.deleteAttachment(props.issueId, attachment.attachmentId);
    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('issueDetails.attachmentDeleteSuccess'),
      life: 3000,
    });
    emit('saved');
  } catch (error) {
    console.error('Error deleting attachment:', error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('issueDetails.attachmentDeleteError'),
      life: 3000,
    });
  } finally {
    deletingAttachmentId.value = null;
  }
}
</script>

<template>
  <Card class="flex flex-col gap-4 basis-full">
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

        <FileUpload
          mode="basic"
          name="attachment"
          :chooseLabel="t('issueDetails.attachmentsUploadButton')"
          chooseIcon="pi pi-upload"
          multiple
          auto
          customUpload
          accept="image/*,application/pdf"
          :maxFileSize="10485760"
          :fileLimit="10"
          :disabled="loadingUpload"
          @uploader="handleUpload"
        />

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
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            :disabled="!attachment.attachmentId || deletingAttachmentId !== null"
            :loading="deletingAttachmentId === attachment.attachmentId"
            @click="handleDelete(attachment)"
          />
        </div>
      </div>
    </template>
  </Card>
</template>
