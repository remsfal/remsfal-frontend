<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import BaseCard from '@/components/common/BaseCard.vue';
import { issueService, type IssueJson } from '@/services/IssueService';
import { getIssueCategoryLabel, getIssuePriorityLabel, getIssueStatusLabel } from '@/features/tenant/tenantIssues/issueLabels';
import { getIssueTypeLabel, getUnitTypeLabel } from '@/features/tenant/tenantIssues/issueLabels';

const props = defineProps<{ issueId: string }>();

const toast = useToast();
const { t, locale } = useI18n();

const loading = ref(false);
const issue = ref<IssueJson | null>(null);
const error = ref<string | null>(null);
const statusLabel = computed(() => getIssueStatusLabel(issue.value?.status, t));
const typeLabel = computed(() => getIssueTypeLabel(issue.value?.type, t));
const categoryLabel = computed(() => getIssueCategoryLabel(issue.value?.category, t));
const priorityLabel = computed(() => getIssuePriorityLabel(issue.value?.priority, t));
const rentalUnitTypeLabel = computed(() => getUnitTypeLabel(issue.value?.rentalUnitType, t));
const issueNodeId = computed(() => issue.value?.id?.split('-').pop() || issue.value?.id || '—');
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
    issue.value = await issueService.getIssue(props.issueId);
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

    <template v-else-if="issue">
      <BaseCard>
        <template #title>
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
            <div>
              <span class="text-xl font-semibold">{{ issue.title || t('tenantIssues.detail.untitled') }}</span>
              <p class="text-base text-gray-500 font-normal mt-1">
                {{ t('tenantIssues.detail.number') }} {{ issue.id || '—' }}
              </p>
            </div>
          </div>
        </template>
        <template #content>
          <dl class="text-base text-gray-600 space-y-2">
            <div v-if="issue.status" class="flex justify-start gap-2">
              <dt class="font-medium text-gray-500">
                {{ t('tenantIssues.filter.status') }}
              </dt>
              <dd class="text-gray-900">
                {{ statusLabel }}
              </dd>
            </div>
            <div v-if="issue.type" class="flex justify-start gap-2">
              <dt class="font-medium text-gray-500">
                {{ t('tenantIssues.card.type') }}
              </dt>
              <dd class="text-gray-900">
                {{ typeLabel }}
              </dd>
            </div>
            <div v-if="issue.category" class="flex justify-start gap-2">
              <dt class="font-medium text-gray-500">
                {{ t('tenantIssues.detail.category') }}
              </dt>
              <dd class="text-gray-900">
                {{ categoryLabel }}
              </dd>
            </div>
            <div v-if="issue.priority" class="flex justify-start gap-2">
              <dt class="font-medium text-gray-500">
                {{ t('tenantIssues.detail.priority') }}
              </dt>
              <dd class="text-gray-900">
                {{ priorityLabel }}
              </dd>
            </div>
            <div v-if="issue.rentalUnitType" class="flex justify-start gap-2">
              <dt class="font-medium text-gray-500">
                {{ t('tenantIssues.detail.rentalUnitType') }}
              </dt>
              <dd class="text-gray-900">
                {{ rentalUnitTypeLabel }}
              </dd>
            </div>
            <div v-if="issue.id" class="flex justify-start gap-2">
              <dt class="font-medium text-gray-500">
                {{ t('tenantIssues.detail.issueNode') }}
              </dt>
              <dd class="text-gray-900">
                {{ issueNodeId }}
              </dd>
            </div>
            <div v-if="modifiedAtLabel" class="flex justify-start gap-2">
              <dt class="font-medium text-gray-500">
                {{ t('tenantIssues.detail.updated') }}
              </dt>
              <dd class="text-gray-900">
                {{ modifiedAtLabel }}
              </dd>
            </div>
            <div v-if="issue.description?.trim()" class="flex justify-start gap-2">
              <dt class="font-medium text-gray-500">
                {{ t('tenantIssues.detail.description') }}
              </dt>
              <dd class="text-gray-900 whitespace-pre-line break-words">
                {{ issue.description }}
              </dd>
            </div>
          </dl>
        </template>
      </BaseCard>

      <BaseCard>
        <template #title>
          <span class="text-xl font-semibold">{{ t('tenantIssues.timeline.title') }}</span>
        </template>
        <template #content>
          <div
            data-testid="tenant-issue-timeline-placeholder"
            class="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-gray-600"
          >
            {{ t('tenantIssues.timeline.placeholder') }}
          </div>
        </template>
      </BaseCard>
    </template>
  </div>
</template>
