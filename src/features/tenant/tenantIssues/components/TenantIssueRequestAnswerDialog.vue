<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import FileUpload from 'primevue/fileupload';
import BaseDialog from '@/components/BaseDialog.vue';
import TimelineEntryCard from '@/components/TimelineEntryCard.vue';
import { useAppToast } from '@/composables/useAppToast';
import { useTimelineComposer } from '@/composables/useTimeline';
import { toAttachmentViews } from '@/helper/attachmentHelper';
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

const { messageText, selectedFiles, fileUploadKey, onFilesSelected, resetComposer } =
  useTimelineComposer();
const sending = ref(false);

const requestAttachments = computed(() => toAttachmentViews(props.request?.attachments));

const canSubmit = computed(
  () => (messageText.value.trim().length > 0 || selectedFiles.value.length > 0) && !sending.value,
);

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      resetComposer();
    }
  },
);

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
      <TimelineEntryCard
        v-if="request"
        :title="t('tenantIssues.requests.originalMessageLabel')"
        :message="request.message"
        :attachments="requestAttachments"
        :attachmentsLabel="t('tenantIssues.timeline.attachmentsCount')"
        :downloadAttachmentLabel="t('tenantIssues.timeline.downloadAttachment')"
        hideDate
        testId="request-answer-original-message"
      />

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
