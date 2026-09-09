<script setup lang="ts">
import { ref } from 'vue';
import { useAppToast } from '@/composables/useAppToast';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import { issueService, type IssueJson } from '@/features/project/issues/services/IssueService';
import { useUserSessionStore } from '@/stores/UserSession';

const props = defineProps<{ issueId: string }>();
const emit = defineEmits<{ accepted: [issue: IssueJson] }>();

const appToast = useAppToast();
const { t } = useI18n();
const sessionStore = useUserSessionStore();
const loading = ref(false);

async function handleAccept() {
  if (loading.value) return;

  const currentUserId = sessionStore.user?.id;
  if (!currentUserId) {
    appToast.error(t('issueDetails.acceptRequest.error'));
    return;
  }

  loading.value = true;
  try {
    const updated = await issueService.updateIssue(props.issueId, {
      status: 'OPEN',
      assigneeId: currentUserId,
    });

    appToast.success(t('issueDetails.acceptRequest.success'), { summary: t('success.saved') });
    emit('accepted', updated);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Button
    :label="t('issueDetails.acceptRequest.button')"
    icon="pi pi-check"
    :disabled="loading"
    :loading="loading"
    @click="handleAccept"
  />
</template>
