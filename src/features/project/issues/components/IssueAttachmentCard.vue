<script setup lang="ts">
import { computed, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import Card from 'primevue/card';
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import type { FileUploadUploaderEvent } from 'primevue/fileupload';
import Galleria from 'primevue/galleria';
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
        <FileUpload
          mode="advanced"
          name="attachment"
          :chooseLabel="t('issueDetails.attachmentsUploadButton')"
          :uploadLabel="t('issueDetails.attachmentsUploadStartButton')"
          multiple
          customUpload
          accept="image/*,application/pdf"
          :maxFileSize="10485760"
          :fileLimit="10"
          :showCancelButton="false"
          :disabled="loadingUpload"
          @uploader="handleUpload"
        />

        <div v-if="attachments.length === 0" class="text-sm text-gray-500">
          {{ t('issueDetails.noAttachments') }}
        </div>

        <Galleria
          v-if="imageAttachments.length > 0"
          :value="imageAttachments"
          :numVisible="5"
          :showItemNavigators="true"
          :showThumbnails="true"
          :showIndicators="false"
          :fullScreen="false"
          :circular="false"
          containerStyle="max-width: 100%"
          class="w-full"
        >
          <template #item="{ item }">
            <img
              :src="getAttachmentDownloadUrl(item)"
              :alt="item.fileName ?? 'issue-attachment'"
              class="w-full max-h-96 object-contain"
            >
          </template>
          <template #thumbnail="{ item }">
            <img
              :src="getAttachmentDownloadUrl(item)"
              :alt="item.fileName ?? 'issue-attachment-thumbnail'"
              class="w-full h-20 object-cover"
            >
          </template>
        </Galleria>

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
