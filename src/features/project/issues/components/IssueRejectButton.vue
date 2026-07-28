<script setup lang="ts">
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import BaseDialog from '@/components/common/BaseDialog.vue';
import { issueService, type IssueJson } from '@/services/IssueService';
import { issueTimelineService } from '@/features/project/issues/services/IssueTimelineService';
import { useUserSessionStore } from '@/stores/UserSession';

const props = defineProps<{ issueId: string }>();
const emit = defineEmits<{ rejected: [issue: IssueJson] }>();

const toast = useToast();
const { t } = useI18n();
const sessionStore = useUserSessionStore();

const showDialog = ref(false);
const reason = ref('');
const loading = ref(false);

function openDialog() {
  reason.value = '';
  showDialog.value = true;
}

async function handleConfirm() {
  if (loading.value) return;

  const currentUserId = sessionStore.user?.id;
  if (!currentUserId) {
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('issueDetails.rejectRequest.error'),
      life: 3000,
    });
    return;
  }

  loading.value = true;
  try {
    const updated = await issueService.updateIssue(props.issueId, {
      status: 'REJECTED',
      assigneeId: currentUserId,
    });

    const trimmedReason = reason.value.trim();
    if (trimmedReason) {
      await issueTimelineService.createTimelineEntry(props.issueId, 'STATUS_CHANGED', trimmedReason);
    }

    showDialog.value = false;
    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('issueDetails.rejectRequest.success'),
      life: 3000,
    });
    emit('rejected', updated);
  } catch (err) {
    console.error(err);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('issueDetails.rejectRequest.error'),
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Button
    :label="t('issueDetails.rejectRequest.button')"
    icon="pi pi-times"
    severity="danger"
    :disabled="loading"
    @click="openDialog"
  />

  <BaseDialog v-model:visible="showDialog" :header="t('issueDetails.rejectRequest.dialogTitle')">
    <div class="flex flex-col gap-3">
      <label for="reject-reason" class="text-sm text-gray-600">{{ t('issueDetails.rejectRequest.reasonLabel') }}</label>
      <Textarea
        id="reject-reason"
        v-model="reason"
        rows="4"
        :placeholder="t('issueDetails.rejectRequest.reasonPlaceholder')"
      />
      <p class="text-sm text-gray-500">
        {{ t('issueDetails.rejectRequest.hint') }}
      </p>
    </div>
    <template #footer>
      <Button :label="t('button.cancel')" severity="secondary" @click="showDialog = false" />
      <Button
        :label="t('issueDetails.rejectRequest.submitButton')"
        severity="danger"
        :disabled="loading"
        :loading="loading"
        @click="handleConfirm"
      />
    </template>
  </BaseDialog>
</template>
