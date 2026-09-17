<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import FileUpload from 'primevue/fileupload';
import type { FileUploadSelectEvent } from 'primevue/fileupload';
import BaseDialog from '@/components/BaseDialog.vue';
import { useAppToast } from '@/composables/useAppToast';
import { tenantIssueRequestService, type IssueRequestJson }
  from '@/features/tenant/tenantIssues/services/TenantIssueRequestService';

const props = defineProps<{
  visible: boolean;
  issueId: string;
  request: IssueRequestJson | null;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  answered: [];
}>();

const { t } = useI18n();
const appToast = useAppToast();

const messageText = ref('');
const selectedFiles = ref<File[]>([]);
const fileUploadKey = ref(0);
const sending = ref(false);

const canSubmit = computed(() => messageText.value.trim().length > 0 && !sending.value);

const resetComposer = () => {
  messageText.value = '';
  selectedFiles.value = [];
  fileUploadKey.value += 1;
};

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      resetComposer();
    }
  },
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

const close = () => {
  emit('update:visible', false);
};

const submit = async () => {
  if (!canSubmit.value || !props.request?.issueRequestId) {
    return;
  }

  sending.value = true;
  try {
    await tenantIssueRequestService.answerRequest(
      props.issueId,
      props.request.issueRequestId,
      { message: messageText.value.trim() },
      selectedFiles.value,
    );
    appToast.success(t('tenantIssues.requests.sendSuccess'));
    resetComposer();
    emit('answered');
    emit('update:visible', false);
  } catch (sendError) {
    console.error('Error answering issue request:', sendError);
    appToast.error(t('tenantIssues.requests.sendError'));
  } finally {
    sending.value = false;
  }
};
</script>

<template>
  <BaseDialog
    :visible="props.visible"
    :header="t('tenantIssues.requests.dialogTitle')"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="flex flex-col gap-4">
      <div v-if="request" class="flex flex-col gap-1">
        <span class="text-sm font-semibold text-gray-700">
          {{ t('tenantIssues.requests.originalMessageLabel') }}
        </span>
        <p class="whitespace-pre-line text-gray-900" data-testid="request-answer-original-message">
          {{ request.message }}
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <label for="request-answer-message" class="sr-only">
          {{ t('tenantIssues.requests.answerPlaceholder') }}
        </label>
        <Textarea
          id="request-answer-message"
          v-model="messageText"
          data-testid="request-answer-message-input"
          rows="4"
          :placeholder="t('tenantIssues.requests.answerPlaceholder')"
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
          accept="image/*"
          :maxFileSize="10485760"
          :fileLimit="10"
          :disabled="sending"
          data-testid="request-answer-file-upload"
          @select="onFilesSelected"
        >
          <template #empty>
            <div>{{ t('timeline.uploadEmpty') }}</div>
          </template>
        </FileUpload>
      </div>
    </div>

    <template #footer>
      <Button
        :label="t('button.cancel')"
        severity="secondary"
        :disabled="sending"
        @click="close"
      />
      <Button
        data-testid="request-answer-submit"
        :label="t('tenantIssues.requests.sendButton')"
        icon="pi pi-send"
        :loading="sending"
        :disabled="!canSubmit"
        @click="submit"
      />
    </template>
  </BaseDialog>
</template>
