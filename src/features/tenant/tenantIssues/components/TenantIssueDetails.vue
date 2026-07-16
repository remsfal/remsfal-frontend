<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import TenantIssueTimelineCard from '@/features/tenant/tenantIssues/components/TenantIssueTimelineCard.vue';
import { tenantIssueService, type TenantIssueJson } from '@/services/TenantIssueService';

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
  </div>
</template>
