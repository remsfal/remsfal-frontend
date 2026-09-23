<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import FileUpload from 'primevue/fileupload';
import type { FileUploadSelectEvent } from 'primevue/fileupload';
import BaseCard from '@/components/BaseCard.vue';
import { useAppToast } from '@/composables/useAppToast';
import { useEventBus } from '@/stores/EventStore';
import { issueRequestService } from '@/features/contractor/orderManagement/services/IssueRequestService';

const props = defineProps<{ issueId: string }>();

const { t } = useI18n();
const appToast = useAppToast();
const eventBus = useEventBus();

const messageText = ref('');
const selectedFiles = ref<File[]>([]);
const fileUploadKey = ref(0);
const sending = ref(false);

const canSubmit = computed(
  () => (messageText.value.trim().length > 0 || selectedFiles.value.length > 0) && !sending.value,
);

const mergeSelectedFiles = (currentFiles: File[], newFiles: File[]) => {
  const uniqueFiles = new Map<string, File>();
  [...currentFiles, ...newFiles].forEach((file) => {
    uniqueFiles.set(`${file.name}-${file.size}-${file.lastModified}`, file);
  });
  return Array.from(uniqueFiles.values());
};

const onFilesSelected = (event: FileUploadSelectEvent) => {
  const files = Array.isArray(event.files) ? event.files : [];
  selectedFiles.value = mergeSelectedFiles(selectedFiles.value, files as File[]);
};

const resetComposer = () => {
  messageText.value = '';
  selectedFiles.value = [];
  fileUploadKey.value += 1;
};

const submit = async () => {
  if (!canSubmit.value) return;

  sending.value = true;
  try {
    await issueRequestService.createRequest(
      props.issueId,
      { message: messageText.value.trim() },
      selectedFiles.value,
    );
    appToast.success(t('orderManagement.tenantCommunication.sendSuccess'));
    resetComposer();
    // Backend copies the request into the contractor/tenant timeline on creation.
    eventBus.emit('issueRequest:created', { issueId: props.issueId });
  } catch (sendError) {
    console.error('Failed to create issue request:', sendError);
    appToast.error(t('orderManagement.tenantCommunication.sendError'));
  } finally {
    sending.value = false;
  }
};
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('orderManagement.tenantCommunication.title') }}
    </template>
    <template #content>
      <div class="flex flex-col gap-2">
        <label for="tenant-communication-message" class="sr-only">
          {{ t('orderManagement.tenantCommunication.messagePlaceholder') }}
        </label>
        <Textarea
          id="tenant-communication-message"
          v-model="messageText"
          data-testid="tenant-communication-message-input"
          rows="3"
          :placeholder="t('orderManagement.tenantCommunication.messagePlaceholder')"
          :disabled="sending"
        />
        <FileUpload
          :key="fileUploadKey"
          mode="advanced"
          :chooseLabel="t('timeline.uploadButton')"
          multiple
          customUpload
          :showUploadButton="false"
          :showCancelButton="false"
          accept="image/*,video/*,application/pdf"
          :maxFileSize="10485760"
          :fileLimit="10"
          :disabled="sending"
          data-testid="tenant-communication-file-upload"
          @select="onFilesSelected"
        >
          <template #empty>
            <div>{{ t('timeline.uploadEmpty') }}</div>
          </template>
        </FileUpload>
        <div class="flex justify-end">
          <Button
            data-testid="tenant-communication-message-submit"
            :label="t('orderManagement.tenantCommunication.sendButton')"
            icon="pi pi-send"
            :loading="sending"
            :disabled="!canSubmit"
            @click="submit"
          />
        </div>
      </div>
    </template>
  </BaseCard>
</template>
