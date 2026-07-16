<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';
import BaseCard from '@/components/common/BaseCard.vue';
import BaseDialog from '@/components/common/BaseDialog.vue';
import Tag from 'primevue/tag';
import { tenantIssueService, type TenantIssueJson } from '@/services/TenantIssueService';
import { getIssueCategoryLabel, getIssueStatusLabel, getIssueTypeSeverity,
  getIssueStatusSeverity, getIssueTypeLabel } from '@/features/tenant/tenantIssues/issueLabels';

const props = defineProps<{ issueId: string }>();

const router = useRouter();
const toast = useToast();
const { t, locale } = useI18n();

const loading = ref(false);
const deletingIssue = ref(false);
const showCancelDialog = ref(false);
const issue = ref<TenantIssueJson | null>(null);
const error = ref<string | null>(null);
const statusLabel = computed(() => getIssueStatusLabel(issue.value?.status, t));
const typeLabel = computed(() => getIssueTypeLabel(issue.value?.type, t));
const categoryLabel = computed(() => getIssueCategoryLabel(issue.value?.category, t));
const statusSeverity = computed(() => getIssueStatusSeverity(issue.value?.status));
const typeSeverity = computed(() => getIssueTypeSeverity(issue.value?.type));
const issueNodeId = computed(() => issue.value?.id?.split('-').pop() || issue.value?.id || '—');
const descriptionLabel = computed(() => {
  const description = issue.value?.description;
  if (!description) {
    return null;
  }

  const cleaned = description
    .split('\n')
    .filter(line => !/^\s*(Verursacher|Ort):/i.test(line))
    .join('\n')
    .trim();

  return cleaned || null;
});
const modifiedAtLabel = computed(() => {
  const modifiedAt = issue.value?.modifiedAt;
  if (!modifiedAt) {
    return null;
  }

  const date = new Date(modifiedAt);
  if (Number.isNaN(date.getTime())) {
    return modifiedAt;
  }

  return date.toLocaleDateString(locale.value);
});

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

const cancelIssue = async () => {
  if (deletingIssue.value) {
    return;
  }

  deletingIssue.value = true;

  try {
    await tenantIssueService.closeIssue(issue.value?.id || props.issueId);
    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('tenantIssues.detail.cancelSuccess'),
      life: 4000,
    });
    await router.push({ name: 'TenantIssues' });
  } catch (deleteError) {
    console.error('Error deleting tenant issue:', deleteError);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('tenantIssues.detail.cancelError'),
      life: 5000,
    });
  } finally {
    deletingIssue.value = false;
  }
};

const openCancelDialog = () => {
  showCancelDialog.value = true;
};

const confirmCancelIssue = () => {
  showCancelDialog.value = false;
  cancelIssue();
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