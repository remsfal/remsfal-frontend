<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import BaseCard from '@/components/common/BaseCard.vue';
import { issueService, type IssueJson } from '@/services/IssueService';

const props = defineProps<{ issueId: string }>();

const toast = useToast();
const { t } = useI18n();

const loading = ref(false);
const issue = ref<IssueJson | null>(null);
const error = ref<string | null>(null);

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
            <div class="flex justify-start gap-2">
              <dt class="font-medium text-gray-500">
                {{ t('tenantIssues.filter.status') }}
              </dt>
              <dd class="text-gray-900">
                {{ issue.status || '—' }}
              </dd>
            </div>
            <div class="flex justify-start gap-2">
              <dt class="font-medium text-gray-500">
                {{ t('tenantIssues.card.type') }}
              </dt>
              <dd class="text-gray-900">
                {{ issue.type || '—' }}
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
