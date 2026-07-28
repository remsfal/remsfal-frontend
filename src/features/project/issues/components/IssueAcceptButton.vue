<script setup lang="ts">
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import { issueService, type IssueJson } from '@/services/IssueService';
import { useUserSessionStore } from '@/stores/UserSession';

const props = defineProps<{ issueId: string }>();
const emit = defineEmits<{ accepted: [issue: IssueJson] }>();

const toast = useToast();
const { t } = useI18n();
const sessionStore = useUserSessionStore();
const loading = ref(false);

async function handleAccept() {
  if (loading.value) return;

  const currentUserId = sessionStore.user?.id;
  if (!currentUserId) {
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('issueDetails.acceptRequest.error'),
      life: 3000,
    });
    return;
  }

  loading.value = true;
  try {
    const updated = await issueService.updateIssue(props.issueId, {
      status: 'OPEN',
      assigneeId: currentUserId,
    });

    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('issueDetails.acceptRequest.success'),
      life: 3000,
    });
    emit('accepted', updated);
  } catch (err) {
    console.error(err);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('issueDetails.acceptRequest.error'),
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Button
    :label="t('issueDetails.acceptRequest.button')"
    icon="pi pi-check"
    severity="secondary"
    :disabled="loading"
    :loading="loading"
    @click="handleAccept"
  />
</template>
