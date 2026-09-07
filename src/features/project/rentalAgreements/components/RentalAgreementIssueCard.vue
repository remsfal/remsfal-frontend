<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BaseCard from '@/components/BaseCard.vue';
import IssueTable, { type IssueColumn } from '../../issues/components/IssueTable.vue';
import type { IssueItemJson } from '@/features/project/issues/services/IssueService';
import { useIssueList } from '../../issues/composables/useIssueList';

const props = defineProps<{
  projectId: string; agreementId: string;
}>();
const router = useRouter();
const { t } = useI18n();

const { issues, loadIssues } = useIssueList();

const columns = computed<IssueColumn[]>(() =>
  ['issueNumber', 'title', 'type', 'status', 'assignee', 'modifiedAt']
);

const onIssueSelect = (issue: IssueItemJson) => {
  router.push({ name: 'IssueDetails', params: { projectId: props.projectId, issueId: issue.id ?? '' } });
};

onMounted(() => loadIssues({ projectId: props.projectId, agreementId: props.agreementId }));
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('rentalAgreement.issue.heading.tasks') }}
    </template>
    <template #content>
      <IssueTable
        :issues="issues"
        :projectId="props.projectId"
        :columns="columns"
        @rowSelect="onIssueSelect"
      />
    </template>
  </BaseCard>
</template>