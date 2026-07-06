<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import BaseCard from '@/components/common/BaseCard.vue';
import type { IssueJson } from '@/services/IssueService';
import { getIssueCategoryLabel, getIssueStatusLabel, getIssueTypeSeverity,
  getIssueStatusSeverity, getIssueTypeLabel } from '@/features/tenant/tenantIssues/issueLabels';

const props = defineProps<{
  issue: IssueJson;
  deletingIssue: boolean;
}>();

const emit = defineEmits<{
  cancel: [];
}>();

const { t, locale } = useI18n();

const statusLabel = computed(() => getIssueStatusLabel(props.issue.status, t));
const typeLabel = computed(() => getIssueTypeLabel(props.issue.type, t));
const categoryLabel = computed(() => getIssueCategoryLabel(props.issue.category, t));
const statusSeverity = computed(() => getIssueStatusSeverity(props.issue.status));
const typeSeverity = computed(() => getIssueTypeSeverity(props.issue.type));
const issueNodeId = computed(() => props.issue.id?.split('-').pop() || props.issue.id || '—');
const descriptionLabel = computed(() => {
  const description = props.issue.description;
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
  const modifiedAt = props.issue.modifiedAt;
  if (!modifiedAt) {
    return null;
  }

  const date = new Date(modifiedAt);
  if (Number.isNaN(date.getTime())) {
    return modifiedAt;
  }

  return date.toLocaleDateString(locale.value);
});
const canCancel = computed(() => {
  return props.issue.type !== 'TERMINATION' &&
    props.issue.status !== 'CLOSED' &&
    props.issue.status !== 'REJECTED';
});
</script>

<template>
  <BaseCard>
    <template #title>
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <span class="text-xl font-semibold">{{ issue.title || t('tenantIssues.detail.untitled') }}</span>
          <p class="text-base text-gray-500 font-normal mt-1">
            {{ t('tenantIssues.detail.number') }} {{ issue.id || '—' }}
          </p>
        </div>
        <Button
          v-if="canCancel"
          :label="t('tenantIssues.detail.cancelIssue')"
          icon="pi pi-trash"
          severity="danger"
          class="shrink-0 self-start"
          data-testid="tenant-issue-cancel"
          :loading="deletingIssue"
          :disabled="deletingIssue"
          @click="emit('cancel')"
        />
      </div>
    </template>
    <template #content>
      <div class="grid grid-cols-1 gap-4 lg:min-[1000px]:grid-cols-2 xl:grid-cols-3 ">
        <dl class="space-y-2 text-base text-gray-600">
          <div v-if="issue.id" class="flex items-center justify-start gap-2">
            <dt class="font-medium text-gray-500">
              {{ t('tenantIssues.detail.issueNode') }}
            </dt>
            <dd class="text-gray-900">
              <Tag :value="issueNodeId" severity="info" class="inline-flex w-fit" />
            </dd>
          </div>
          <div v-if="modifiedAtLabel" class="flex items-center justify-start gap-2">
            <dt class="font-medium text-gray-500">
              {{ t('tenantIssues.detail.updated') }}
            </dt>
            <dd class="text-gray-900">
              <Tag :value="modifiedAtLabel" severity="info" class="inline-flex w-fit" />
            </dd>
          </div>
        </dl>

        <dl class="space-y-2 text-base text-gray-600">
          <div v-if="issue.type" class="flex items-center justify-start gap-2">
            <dt class="font-medium text-gray-500">
              {{ t('tenantIssues.card.type') }}
            </dt>
            <dd class="text-gray-900">
              <Tag :value="typeLabel" :severity="typeSeverity" class="inline-flex w-fit" />
            </dd>
          </div>
          <div v-if="issue.location?.trim()" class="flex justify-start gap-2">
            <dt class="font-medium text-gray-500">
              {{ t('tenantIssues.detail.location') }}
            </dt>
            <dd class="text-gray-900 break-words">
              {{ issue.location }}
            </dd>
          </div>
        </dl>

        <dl class="space-y-2 text-base text-gray-600">
          <div v-if="issue.status" class="flex items-center justify-start gap-2">
            <dt class="font-medium text-gray-500">
              {{ t('tenantIssues.filter.status') }}
            </dt>
            <dd class="text-gray-900">
              <Tag :value="statusLabel" :severity="statusSeverity" class="inline-flex w-fit" />
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
        </dl>
      </div>

      <div v-if="descriptionLabel" class="mt-4 text-base text-gray-600">
        {{ t('tenantIssues.detail.description') }}
        <span class="text-gray-900 whitespace-pre-line break-words">
          {{ descriptionLabel }}
        </span>
      </div>
    </template>
  </BaseCard>
</template>
