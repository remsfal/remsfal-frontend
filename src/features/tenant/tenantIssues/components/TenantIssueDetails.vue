<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import TenantIssueTimelineCard from '@/features/tenant/tenantIssues/components/TenantIssueTimelineCard.vue';
import BaseDialog from '@/components/common/BaseDialog.vue';
import Button from 'primevue/button';
import { tenantIssueService, type TenantIssueJson } from '@/services/TenantIssueService';
import TenantIssueSummaryCard from '@/features/tenant/tenantIssues/components/TenantIssueSummaryCard.vue';

const props = defineProps<{ issueId: string }>();

const toast = useToast();
const { t } = useI18n();

const loading = ref(false);
const issue = ref<TenantIssueJson | null>(null);
const error = ref<string | null>(null);

const fetchIssue = async () => {
  loading.value = true;
  error.value = null;

  try {
    issue.value = await tenantIssueService.getIssue(props.issueId);
  } catch (fetchError) {
    console.error('Error fetching tenant issue:', fetchError);
    error.value = t('tenantIssues.detail.loadError');
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('tenantIssues.detail.loadError'),
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchIssue();
});

watch(
  () => props.issueId,
  () => {
    fetchIssue();
  }
);
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <h1 class="text-2xl font-semibold text-gray-900">
        {{ t('tenantIssues.detail.title') }}
      </h1>
    </div>

    <Message v-if="error" severity="error" :closable="false">
      {{ error }}
    </Message>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <span class="ml-3 text-gray-600">{{ t('tenantIssues.loading') }}</span>
    </div>

    <TenantIssueTimelineCard v-else-if="issue" :issueId="issue.id || props.issueId" />
    <template v-else-if="issue">
      <TenantIssueSummaryCard
        :issue="issue"
        :deletingIssue="deletingIssue"
        @cancel="openCancelDialog"
      />
    </template>

    <BaseDialog
      v-model:visible="showCancelDialog"
      :header="t('tenantIssues.detail.cancelIssue')"
    >
      <p class="mb-4">
        {{ t('tenantIssues.detail.cancelConfirm') }}
      </p>
      <template #footer>
        <Button
          :label="t('button.cancel')"
          severity="secondary"
          @click="showCancelDialog = false"
        />
        <Button
          :label="t('tenantIssues.detail.cancelIssue')"
          severity="danger"
          icon="pi pi-trash"
          data-testid="tenant-issue-cancel-confirm"
          :loading="deletingIssue"
          :disabled="deletingIssue"
          @click="confirmCancelIssue"
        />
      </template>
    </BaseDialog>
  </div>
</template>